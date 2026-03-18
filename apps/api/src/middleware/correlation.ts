/**
 * Correlation ID middleware - propagate x-correlation-id across requests.
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import { getOrCreateCorrelationId, CORRELATION_HEADER } from "@canton-mvp/observability";

declare module "fastify" {
  interface FastifyRequest {
    correlationId?: string;
  }
}

export async function correlationMiddleware(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const headers = req.headers as Record<string, string | undefined>;
  const correlationId = getOrCreateCorrelationId(headers);
  req.correlationId = correlationId;
  reply.header(CORRELATION_HEADER, correlationId);
}
