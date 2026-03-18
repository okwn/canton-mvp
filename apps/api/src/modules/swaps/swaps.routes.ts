/**
 * Swaps module - quote and swap workflows.
 */

import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { z } from "zod";
import { authMiddleware } from "../auth/auth.middleware.js";

const quoteRequestSchema = z.object({
  requester: z.string().min(1),
  counterparty: z.string().min(1),
  giveInstrument: z.object({ admin: z.string(), symbol: z.string() }),
  giveAmount: z.string(),
  receiveInstrument: z.object({ admin: z.string(), symbol: z.string() }),
  receiveAmount: z.string(),
  validUntilMs: z.number().optional(),
});

const quoteResponseSchema = z.object({
  requestId: z.string(),
  counterparty: z.string(),
  giveInstrument: z.object({ admin: z.string(), symbol: z.string() }),
  giveAmount: z.string(),
  receiveInstrument: z.object({ admin: z.string(), symbol: z.string() }),
  receiveAmount: z.string(),
  validUntilMs: z.number().optional(),
});

const acceptSchema = z.object({ responseId: z.string(), decidedBy: z.string() });
const rejectSchema = z.object({ responseId: z.string(), decidedBy: z.string(), reason: z.string().optional() });

export async function registerSwaps(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  app.addHook("preHandler", authMiddleware);

  app.post(
    "/quotes",
    {
      schema: {
        description: "Request quote (RFQ)",
        body: {
          type: "object",
          properties: {
            requester: { type: "string" },
            counterparty: { type: "string" },
            giveInstrument: { type: "object", properties: { admin: { type: "string" }, symbol: { type: "string" } } },
            giveAmount: { type: "string" },
            receiveInstrument: { type: "object", properties: { admin: { type: "string" }, symbol: { type: "string" } } },
            receiveAmount: { type: "string" },
            validUntilMs: { type: "number" },
          },
        },
        response: { 201: { type: "object", properties: { id: { type: "string" }, requester: { type: "string" }, counterparty: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const parsed = quoteRequestSchema.safeParse(req.body);
      if (!parsed.success) return reply.badRequest(parsed.error.message);
      const p = parsed.data;
      const request = await app.ctx.swapEngine.requestQuote(
        p.requester,
        p.counterparty,
        p.giveInstrument,
        p.giveAmount,
        p.receiveInstrument,
        p.receiveAmount,
        p.validUntilMs
      );
      return reply.status(201).send(request);
    }
  );

  app.post(
    "/quotes/respond",
    {
      schema: {
        description: "Respond to quote",
        body: {
          type: "object",
          properties: {
            requestId: { type: "string" },
            counterparty: { type: "string" },
            giveInstrument: { type: "object" },
            giveAmount: { type: "string" },
            receiveInstrument: { type: "object" },
            receiveAmount: { type: "string" },
            validUntilMs: { type: "number" },
          },
        },
        response: { 201: { type: "object", properties: { id: { type: "string" }, requestId: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const parsed = quoteResponseSchema.safeParse(req.body);
      if (!parsed.success) return reply.badRequest(parsed.error.message);
      const p = parsed.data;
      const response = await app.ctx.swapEngine.respondToQuote(
        p.requestId,
        p.counterparty,
        p.giveInstrument,
        p.giveAmount,
        p.receiveInstrument,
        p.receiveAmount,
        p.validUntilMs
      );
      return reply.status(201).send(response);
    }
  );

  app.post(
    "/quotes/accept",
    {
      schema: {
        description: "Accept quote and create deal",
        body: { type: "object", properties: { responseId: { type: "string" }, decidedBy: { type: "string" } } },
        response: {
          200: {
            type: "object",
            properties: {
              decision: { type: "object" },
              deal: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  state: { type: "string" },
                  giveLeg: { type: "object" },
                  receiveLeg: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const parsed = acceptSchema.safeParse(req.body);
      if (!parsed.success) return reply.badRequest(parsed.error.message);
      const result = await app.ctx.swapEngine.acceptQuote(parsed.data.responseId, parsed.data.decidedBy);
      return reply.send(result);
    }
  );

  app.post(
    "/quotes/reject",
    {
      schema: {
        description: "Reject quote",
        body: { type: "object", properties: { responseId: { type: "string" }, decidedBy: { type: "string" }, reason: { type: "string" } } },
        response: { 200: { type: "object", properties: { outcome: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const parsed = rejectSchema.safeParse(req.body);
      if (!parsed.success) return reply.badRequest(parsed.error.message);
      const decision = await app.ctx.swapEngine.rejectQuote(
        parsed.data.responseId,
        parsed.data.decidedBy,
        parsed.data.reason
      );
      return reply.send(decision);
    }
  );

  app.get(
    "/deals/:dealId",
    {
      schema: {
        description: "Get deal by id",
        params: { type: "object", properties: { dealId: { type: "string" } } },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              state: { type: "string" },
              giveLeg: { type: "object", properties: { party: { type: "string" }, instrumentId: { type: "object" }, amount: { type: "string" }, direction: { type: "string" } } },
              receiveLeg: { type: "object", properties: { party: { type: "string" }, instrumentId: { type: "object" }, amount: { type: "string" }, direction: { type: "string" } } },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { dealId } = req.params as { dealId: string };
      const deal = await app.ctx.swapEngine.getDeal(dealId);
      if (!deal) return reply.notFound();
      return reply.send(deal);
    }
  );

  app.post(
    "/deals/:dealId/cancel",
    {
      schema: {
        description: "Cancel deal",
        params: { type: "object", properties: { dealId: { type: "string" } } },
        response: { 200: { type: "object", properties: { id: { type: "string" }, state: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const { dealId } = req.params as { dealId: string };
      const cancelled = await app.ctx.swapEngine.cancelDeal(dealId);
      return reply.send(cancelled);
    }
  );
}
