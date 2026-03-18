/**
 * Auth module routes.
 */

import type { FastifyInstance, FastifyPluginOptions } from "fastify";

export async function registerAuth(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  app.post(
    "/login",
    {
      schema: {
        description: "Authenticate and obtain session (mock for development)",
        body: {
          type: "object",
          properties: { externalId: { type: "string" }, email: { type: "string" } },
        },
        response: { 200: { type: "object", properties: { userId: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const body = req.body as { externalId?: string; email?: string };
      const externalId = body.externalId ?? `ext-${Date.now()}`;
      const existing = await app.ctx.identity.getUserByExternalId(externalId);
      if (existing) return reply.send({ userId: existing.id });
      // TODO(production): Remove SEED_ADMIN_EXTERNAL_ID; use IdP for admin role.
      const isAdmin = externalId === "admin" || process.env["SEED_ADMIN_EXTERNAL_ID"] === externalId;
      const user = await app.ctx.identity.createUser({
        externalId,
        ...(body.email !== undefined && { email: body.email }),
        role: isAdmin ? "admin" : "user",
      });
      return reply.send({ userId: user.id });
    }
  );

  app.get(
    "/me",
    {
      schema: {
        description: "Get current user from auth header (mock)",
        response: { 200: { type: "object", properties: { userId: { type: "string" } } } },
      },
    },
    async (req, reply) => {
      const authHeader = req.headers.authorization;
      const userId = authHeader?.replace(/^Bearer\s+/i, "") ?? "anonymous";
      return reply.send({ userId });
    }
  );
}
