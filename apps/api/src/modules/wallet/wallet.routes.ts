/**
 * Wallet module - session state and wallet linkage.
 */

import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { z } from "zod";
import { authMiddleware } from "../auth/auth.middleware.js";

const walletLinkageSchema = z.object({
  providerId: z.string().min(1),
  partyId: z.string().min(1),
  walletAddress: z.string().optional(),
});

export async function registerWallet(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  app.addHook("preHandler", authMiddleware);

  app.post(
    "/users/:userId/link",
    {
      schema: {
        description: "Store wallet linkage for user",
        params: { type: "object", properties: { userId: { type: "string" } } },
        body: {
          type: "object",
          properties: { providerId: { type: "string" }, partyId: { type: "string" }, walletAddress: { type: "string" } },
        },
        response: { 201: { type: "object", properties: { id: { type: "string" }, userId: { type: "string" }, partyId: { type: "string" }, providerId: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const { userId } = req.params as { userId: string };
      const parsed = walletLinkageSchema.safeParse(req.body);
      if (!parsed.success) return reply.badRequest(parsed.error.message);
      const wallet = await app.ctx.identity.storeWalletLinkage({
        userId,
        providerId: parsed.data.providerId,
        partyId: parsed.data.partyId,
        ...(parsed.data.walletAddress !== undefined && { walletAddress: parsed.data.walletAddress }),
      });
      return reply.status(201).send(wallet);
    }
  );

  app.get(
    "/session",
    {
      schema: {
        description: "Get current wallet session (mock provider)",
        response: { 200: { type: "object", properties: { session: { type: "object", properties: { partyId: { type: "string" }, userId: { type: "string" } } }, connectedAt: { type: "number" } } } },
      },
    },
    async (_req, reply) => {
      const session = await app.ctx.walletProvider.getSession();
      if (!session) return reply.send({ session: null, connectedAt: null });
      const connection = { session, connectedAt: Date.now() };
      return reply.send(connection);
    }
  );

  app.post(
    "/connect",
    {
      schema: {
        description: "Connect wallet (mock - returns mock session)",
        response: {
          200: {
            type: "object",
            properties: {
              session: {
                type: "object",
                properties: { partyId: { type: "string" }, userId: { type: "string" }, networkId: { type: "string" } },
              },
              connectedAt: { type: "number" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const correlationId = (req as { correlationId?: string }).correlationId;
      const connection = await app.ctx.walletProvider.connect();
      app.ctx.opsStore.recordCommand({
        ...(correlationId !== undefined && { correlationId }),
        commandType: "wallet_connect",
        partyId: connection.session.partyId,
        status: "submitted",
      });
      return reply.send(connection);
    }
  );

  app.post(
    "/disconnect",
    {
      schema: { description: "Disconnect wallet" },
    },
    async (_req, reply) => {
      const correlationId = (_req as { correlationId?: string }).correlationId;
      await app.ctx.walletProvider.disconnect();
      app.ctx.opsStore.recordCommand({
        ...(correlationId !== undefined && { correlationId }),
        commandType: "wallet_disconnect",
        status: "submitted",
      });
      return reply.send({ ok: true });
    }
  );
}
