/**
 * Admin ops routes - service health, errors, commands, swap states, party audit.
 */

import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { authMiddleware } from "../auth/auth.middleware.js";

async function requireAdmin(app: FastifyInstance, userId: string): Promise<boolean> {
  const perms = await app.ctx.identity.inspectPermissions(userId);
  return perms.isAdmin;
}

export async function registerAdminOps(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  app.addHook("preHandler", authMiddleware);

  app.get(
    "/ops/health",
    {
      schema: {
        description: "Service and dependency health (admin)",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              services: { type: "object" },
              dependencies: { type: "object" },
              wallet: { type: "object" },
              timestamp: { type: "string" },
            },
          },
          403: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (req, reply) => {
      if (!(await requireAdmin(app, req.userId ?? ""))) {
        return reply.status(403).send({ error: "Admin access required" });
      }
      const session = await app.ctx.walletProvider.getSession();
      const validatorStatus = app.ctx.validatorClient ? "configured" : "not_configured";
      return reply.send({
        status: "ok",
        services: {
          identity: "ok",
          swapEngine: "ok",
          opsStore: "ok",
        },
        dependencies: {
          validator: validatorStatus,
          ledger: app.ctx.cantonConfig?.ledgerApiUrl ? "configured" : "not_configured",
        },
        wallet: {
          adapter: app.ctx.walletProvider.id,
          connected: !!session,
          partyId: session?.partyId ?? null,
        },
        timestamp: new Date().toISOString(),
      });
    }
  );

  app.get(
    "/ops/errors",
    {
      schema: {
        description: "Recent errors (admin)",
        querystring: { type: "object", properties: { limit: { type: "number" } } },
        response: {
          200: { type: "array", items: { type: "object" } },
          403: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (req, reply) => {
      if (!(await requireAdmin(app, req.userId ?? ""))) {
        return reply.status(403).send({ error: "Admin access required" });
      }
      const limit = (req.query as { limit?: number }).limit ?? 50;
      const errors = app.ctx.opsStore.getRecentErrors(limit);
      return reply.send(errors);
    }
  );

  app.get(
    "/ops/commands",
    {
      schema: {
        description: "Recent command submissions (admin)",
        querystring: { type: "object", properties: { limit: { type: "number" } } },
        response: {
          200: { type: "array", items: { type: "object" } },
          403: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (req, reply) => {
      if (!(await requireAdmin(app, req.userId ?? ""))) {
        return reply.status(403).send({ error: "Admin access required" });
      }
      const limit = (req.query as { limit?: number }).limit ?? 50;
      const commands = app.ctx.opsStore.getRecentCommands(limit);
      return reply.send(commands);
    }
  );

  app.get(
    "/ops/swaps",
    {
      schema: {
        description: "Swap flow states - deals and quote requests (admin)",
        querystring: { type: "object", properties: { limit: { type: "number" } } },
        response: {
          200: {
            type: "object",
            properties: {
              deals: { type: "array" },
              quoteRequests: { type: "array" },
            },
          },
          403: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (req, reply) => {
      if (!(await requireAdmin(app, req.userId ?? ""))) {
        return reply.status(403).send({ error: "Admin access required" });
      }
      const limit = (req.query as { limit?: number }).limit ?? 50;
      const [deals, quoteRequests] = await Promise.all([
        app.ctx.swapEngine.listDeals(limit),
        app.ctx.swapEngine.listQuoteRequests(limit),
      ]);
      return reply.send({ deals, quoteRequests });
    }
  );

  app.get(
    "/ops/parties",
    {
      schema: {
        description: "Party onboarding audit trail (admin)",
        querystring: { type: "object", properties: { limit: { type: "number" } } },
        response: {
          200: { type: "array", items: { type: "object" } },
          403: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (req, reply) => {
      if (!(await requireAdmin(app, req.userId ?? ""))) {
        return reply.status(403).send({ error: "Admin access required" });
      }
      const limit = (req.query as { limit?: number }).limit ?? 100;
      const parties = await app.ctx.identity.listAllParties(limit);
      return reply.send(parties);
    }
  );
}
