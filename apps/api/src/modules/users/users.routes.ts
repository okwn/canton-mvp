/**
 * Users module - onboarding flow.
 */

import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { authMiddleware } from "../auth/auth.middleware.js";

export async function registerUsers(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  app.addHook("preHandler", authMiddleware);

  app.post(
    "/",
    {
      schema: {
        description: "Create app user (onboarding)",
        body: {
          type: "object",
          properties: { email: { type: "string" }, externalId: { type: "string" }, role: { type: "string", enum: ["user", "admin", "custodian"] } },
        },
        response: { 201: { type: "object", properties: { id: { type: "string" }, email: { type: "string" }, role: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const body = req.body as { email?: string; externalId?: string; role?: "user" | "admin" | "custodian" };
      const externalId = body.externalId ?? req.userId;
      const user = await app.ctx.identity.createUser({
        ...(body.email !== undefined && { email: body.email }),
        ...(externalId !== undefined && { externalId }),
        ...(body.role !== undefined && { role: body.role }),
      });
      return reply.status(201).send(user);
    }
  );

  app.get(
    "/:userId",
    {
      schema: {
        description: "Get user by id",
        params: { type: "object", properties: { userId: { type: "string" } } },
        response: { 200: { type: "object", properties: { id: { type: "string" }, email: { type: "string" }, role: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const { userId } = req.params as { userId: string };
      const user = await app.ctx.identity.getUser(userId);
      if (!user) return reply.notFound();
      return reply.send(user);
    }
  );

  app.get(
    "/:userId/permissions",
    {
      schema: {
        description: "Inspect user permissions",
        params: { type: "object", properties: { userId: { type: "string" } } },
        response: { 200: { type: "object", properties: { role: { type: "string" }, isAdmin: { type: "boolean" }, isCustodian: { type: "boolean" } } } },
      },
    },
    async (req, reply) => {
      const { userId } = req.params as { userId: string };
      const perms = await app.ctx.identity.inspectPermissions(userId);
      return reply.send(perms);
    }
  );
}
