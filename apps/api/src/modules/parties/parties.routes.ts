/**
 * Parties module - party allocation and metadata.
 */

import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { z } from "zod";
import { authMiddleware } from "../auth/auth.middleware.js";

const allocatePartySchema = z.object({
  partyId: z.string().min(1),
  source: z.enum(["validator", "wallet", "manual"]),
  displayName: z.string().optional(),
  networkId: z.string().optional(),
});

const metadataSchema = z.object({
  metadata: z.record(z.unknown()),
});

export async function registerParties(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  app.addHook("preHandler", authMiddleware);

  app.post(
    "/users/:userId/allocate",
    {
      schema: {
        description: "Allocate/link party to user (onboarding)",
        params: { type: "object", properties: { userId: { type: "string" } } },
        body: {
          type: "object",
          properties: { partyId: { type: "string" }, source: { type: "string", enum: ["validator", "wallet", "manual"] }, displayName: { type: "string" }, networkId: { type: "string" } },
        },
        response: { 201: { type: "object", properties: { partyId: { type: "string" }, userId: { type: "string" }, source: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const { userId } = req.params as { userId: string };
      const parsed = allocatePartySchema.safeParse(req.body);
      if (!parsed.success) return reply.badRequest(parsed.error.message);
      const party = await app.ctx.identity.allocateParty({
        userId,
        partyId: parsed.data.partyId,
        source: parsed.data.source,
        ...(parsed.data.displayName !== undefined && { displayName: parsed.data.displayName }),
        ...(parsed.data.networkId !== undefined && { networkId: parsed.data.networkId }),
      });
      return reply.status(201).send(party);
    }
  );

  app.get(
    "/users/:userId",
    {
      schema: {
        description: "List parties for user",
        params: { type: "object", properties: { userId: { type: "string" } } },
        response: { 200: { type: "array", items: { type: "object", properties: { partyId: { type: "string" }, userId: { type: "string" }, source: { type: "string" } } } } },
      },
    },
    async (req, reply) => {
      const { userId } = req.params as { userId: string };
      const parties = await app.ctx.identity.getPartiesForUser(userId);
      return reply.send(parties);
    }
  );

  app.get(
    "/users/:userId/primary",
    {
      schema: {
        description: "Get primary party for user",
        params: { type: "object", properties: { userId: { type: "string" } } },
        response: { 200: { type: "object", properties: { partyId: { type: "string" }, userId: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const { userId } = req.params as { userId: string };
      const party = await app.ctx.identity.getPrimaryParty(userId);
      if (!party) return reply.notFound();
      return reply.send(party);
    }
  );

  app.patch(
    "/:partyId/metadata",
    {
      schema: {
        description: "Attach metadata to party",
        params: { type: "object", properties: { partyId: { type: "string" } } },
        body: { type: "object", properties: { metadata: { type: "object" } } },
        response: { 200: { type: "object", properties: { partyId: { type: "string" }, metadata: { type: "object" } } } },
      },
    },
    async (req, reply) => {
      const { partyId } = req.params as { partyId: string };
      const parsed = metadataSchema.safeParse(req.body);
      if (!parsed.success) return reply.badRequest(parsed.error.message);
      const party = await app.ctx.identity.attachMetadata({ partyId, metadata: parsed.data.metadata });
      return reply.send(party);
    }
  );
}
