/**
 * Tokens module - balances and holdings abstraction.
 */

import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { authMiddleware } from "../auth/auth.middleware.js";
import {
  aggregateHoldingsToBalances,
  type Holding,
} from "@canton-mvp/token-standard";

export async function registerTokens(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  app.addHook("preHandler", authMiddleware);

  app.get(
    "/holdings/:partyId",
    {
      schema: {
        description: "Get holdings for party (mock provider)",
        params: { type: "object", properties: { partyId: { type: "string" } } },
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                instrumentId: { type: "object", properties: { admin: { type: "string" }, symbol: { type: "string" } } },
                amount: { type: "string" },
                contractId: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { partyId } = req.params as { partyId: string };
      const holdings = await app.ctx.walletProvider.getHoldings(partyId);
      return reply.send(holdings);
    }
  );

  app.get(
    "/balances/:partyId",
    {
      schema: {
        description: "Get aggregated balances for party",
        params: { type: "object", properties: { partyId: { type: "string" } } },
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                instrumentId: { type: "object", properties: { admin: { type: "string" }, symbol: { type: "string" } } },
                amount: { type: "string" },
                totalHoldings: { type: "number" },
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { partyId } = req.params as { partyId: string };
      const holdings = await app.ctx.walletProvider.getHoldings(partyId);
      const balances = aggregateHoldingsToBalances(holdings as Holding[]);
      return reply.send(balances);
    }
  );
}
