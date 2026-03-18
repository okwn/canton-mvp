/**
 * Network module - metadata and diagnostics.
 */

import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { optionalAuthMiddleware } from "../auth/auth.middleware.js";

export async function registerNetwork(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  app.addHook("preHandler", optionalAuthMiddleware);

  app.get(
    "/metadata",
    {
      schema: {
        description: "Get network metadata (validator + DSO)",
        response: {
          200: {
            type: "object",
            properties: {
              validatorUser: { type: "object", properties: { userId: { type: "string" }, primaryParty: { type: "string" } } },
              dsoParty: { type: "object", properties: { dsoPartyId: { type: "string" } } },
            },
          },
          502: { type: "object", properties: { error: { type: "string" }, details: { type: "string" } } },
        },
      },
    },
    async (req, reply) => {
      if (!app.ctx.validatorClient) {
        return reply.send({
          validatorUser: null,
          dsoParty: null,
          message: "Validator not configured (set VALIDATOR_API_URL)",
        });
      }
      try {
        const metadata = await app.ctx.validatorClient.getValidatorPartyMetadata();
        return reply.send(metadata);
      } catch (err) {
        req.log.error(err);
        return reply.status(502).send({
          error: "Validator unavailable",
          details: err instanceof Error ? err.message : String(err),
        });
      }
    }
  );

  app.get(
    "/config",
    {
      schema: {
        description: "Get Canton config (URLs only, no secrets)",
        response: {
          200: {
            type: "object",
            properties: {
              ledgerApiUrl: { type: "string" },
              validatorApiUrl: { type: "string" },
              scanApiUrl: { type: "string" },
            },
          },
        },
      },
    },
    async (_req, reply) => {
      const config = app.ctx.cantonConfig;
      if (!config) {
        return reply.send({
          ledgerApiUrl: null,
          validatorApiUrl: null,
          scanApiUrl: null,
          message: "Network not configured",
        });
      }
      return reply.send({
        ledgerApiUrl: config.ledgerApiUrl,
        validatorApiUrl: config.validatorApiUrl,
        scanApiUrl: config.scanApiUrl,
      });
    }
  );
}
