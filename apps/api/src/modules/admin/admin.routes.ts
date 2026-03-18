/**
 * Admin module - inspection endpoints.
 */

import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { authMiddleware } from "../auth/auth.middleware.js";

export async function registerAdmin(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  app.addHook("preHandler", authMiddleware);

  app.get(
    "/health/detailed",
    {
      schema: {
        description: "Detailed health check (admin)",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              services: {
                type: "object",
                properties: {
                  identity: { type: "string" },
                  swapEngine: { type: "string" },
                  wallet: { type: "string" },
                  validator: { type: "string" },
                },
              },
              timestamp: { type: "string" },
            },
          },
          403: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (req, reply) => {
      const perms = await app.ctx.identity.inspectPermissions(req.userId ?? "");
      if (!perms.isAdmin) {
        return reply.status(403).send({ error: "Admin access required" });
      }
      const validatorStatus = app.ctx.validatorClient ? "configured" : "not_configured";
      return reply.send({
        status: "ok",
        services: {
          identity: "ok",
          swapEngine: "ok",
          wallet: "ok",
          validator: validatorStatus,
        },
        timestamp: new Date().toISOString(),
      });
    }
  );

  app.get(
    "/users/:userId/parties",
    {
      schema: {
        description: "List all parties for user (admin)",
        params: { type: "object", properties: { userId: { type: "string" } } },
        response: {
          200: { type: "array", items: { type: "object" } },
          403: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (req, reply) => {
      const perms = await app.ctx.identity.inspectPermissions(req.userId ?? "");
      if (!perms.isAdmin) return reply.status(403).send({ error: "Admin access required" });
      const { userId } = req.params as { userId: string };
      const parties = await app.ctx.identity.getPartiesForUser(userId);
      return reply.send(parties);
    }
  );
}
