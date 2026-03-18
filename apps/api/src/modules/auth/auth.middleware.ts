/**
 * Auth middleware - validates Bearer token via TokenValidator.
 * Uses JWT when AUTH_JWT_SECRET set; otherwise dev opaque-token mode.
 */

import type { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.slice(7);
  const validator = req.server.ctx.authValidator;
  const result = await validator.validate(token);
  if (!result) {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
  req.userId = result.userId;
}

export async function optionalAuthMiddleware(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return;
  const token = authHeader.slice(7);
  const validator = req.server.ctx.authValidator;
  const result = await validator.validate(token);
  if (result) req.userId = result.userId;
}
