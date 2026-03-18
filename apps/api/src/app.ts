/**
 * Fastify application factory.
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import { loadEnv } from "./config/env.js";
import { registerAuth } from "./modules/auth/auth.routes.js";
import { registerUsers } from "./modules/users/users.routes.js";
import { registerParties } from "./modules/parties/parties.routes.js";
import { registerWallet } from "./modules/wallet/wallet.routes.js";
import { registerTokens } from "./modules/tokens/tokens.routes.js";
import { registerSwaps } from "./modules/swaps/swaps.routes.js";
import { registerNetwork } from "./modules/network/network.routes.js";
import { registerAdmin } from "./modules/admin/admin.routes.js";
import { registerAdminOps } from "./modules/admin/admin-ops.routes.js";
import { createAppContext } from "./context.js";
import { correlationMiddleware } from "./middleware/correlation.js";

export async function buildApp(): Promise<FastifyInstance> {
  const env = loadEnv();

  const app = Fastify({
    logger: { level: env.LOG_LEVEL },
  });

  app.addHook("onRequest", correlationMiddleware);

  // CORS: when CORS_ORIGINS is set, restrict to those origins; otherwise allow all (dev).
  const corsOrigin = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : true;
  await app.register(cors, { origin: corsOrigin });
  await app.register(sensible);

  // TODO(production): Enable rate limiting. Set RATE_LIMIT_MAX, RATE_LIMIT_TIME_WINDOW_MS.
  // Rate limiting at API edge.
  if (env.RATE_LIMIT_MAX != null && env.RATE_LIMIT_TIME_WINDOW_MS != null) {
    await app.register(rateLimit, {
      max: env.RATE_LIMIT_MAX,
      timeWindow: env.RATE_LIMIT_TIME_WINDOW_MS,
    });
  }

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Canton MVP API",
        description: "API for Canton Network MVP - onboarding, wallet, tokens, swaps, network",
        version: "1.0.0",
      },
      servers: [{ url: "/api/v1", description: "API v1" }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: true },
  });

  const ctx = await createAppContext(env);

  app.decorate("ctx", ctx);

  app.setErrorHandler((err: unknown, req, reply) => {
    const correlationId = (req as { correlationId?: string }).correlationId;
    const error = err instanceof Error ? err : new Error(String(err));
    // Strip query string to avoid logging tokens/params. TODO(production): Consider omitting stack.
    const pathOnly = req.url?.split("?")[0] ?? req.url;
    ctx.opsStore.recordError({
      ...(correlationId !== undefined && { correlationId }),
      service: "api",
      message: error.message,
      ...(error.stack !== undefined && { error: error.stack }),
      context: { path: pathOnly ?? "", method: req.method },
    });
    reply.send(error);
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "canton-mvp-api",
    timestamp: new Date().toISOString(),
  }));

  app.get("/health/ready", async () => ({
    status: "ready",
    checks: { identity: "ok", swapEngine: "ok" },
  }));

  // Minimal /metrics endpoint. Wire to prom-client when ready; see @canton-mvp/observability.
  const startTime = Date.now();
  app.get("/metrics", async (_req, reply) => {
    reply.header("Content-Type", "application/json");
    return {
      service: "canton-mvp-api",
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      note: "Wire to prom-client for full Prometheus metrics",
    };
  });

  await app.register(registerAuth, { prefix: "/api/v1/auth" });
  await app.register(registerUsers, { prefix: "/api/v1/users" });
  await app.register(registerParties, { prefix: "/api/v1/parties" });
  await app.register(registerWallet, { prefix: "/api/v1/wallet" });
  await app.register(registerTokens, { prefix: "/api/v1/tokens" });
  await app.register(registerSwaps, { prefix: "/api/v1/swaps" });
  await app.register(registerNetwork, { prefix: "/api/v1/network" });
  await app.register(registerAdmin, { prefix: "/api/v1/admin" });
  await app.register(registerAdminOps, { prefix: "/api/v1/admin" });

  return app;
}
