/**
 * Typed environment validation.
 * See docs/security-model.md and .env.example for security notes.
 */

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().min(1).max(65535).default(8080),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
  LEDGER_API_URL: z.string().url().optional(),
  VALIDATOR_API_URL: z.string().url().optional(),
  SCAN_API_URL: z.string().url().optional(),
  AUTH_JWT_SECRET: z.string().min(1).optional(),
  AUTH_BEARER_ENABLED: z.coerce.boolean().default(true),
  SEED_ADMIN_EXTERNAL_ID: z.string().optional(),
  // mTLS for Canton client connections. TODO(production): Wire into validator/canton clients.
  MTLS_CLIENT_CERT_PATH: z.string().optional(),
  MTLS_CLIENT_KEY_PATH: z.string().optional(),
  MTLS_CA_PATH: z.string().optional(),
  // Rate limiting (production: enable)
  RATE_LIMIT_MAX: z.coerce.number().min(1).optional(),
  RATE_LIMIT_TIME_WINDOW_MS: z.coerce.number().min(1000).optional(),
  // CORS (production: restrict). Comma-separated origins.
  CORS_ORIGINS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function loadEnv(): Env {
  if (_env) return _env;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  _env = parsed.data;
  return _env;
}
