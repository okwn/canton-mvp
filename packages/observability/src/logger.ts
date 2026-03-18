/**
 * Structured logging helpers with correlation ID support.
 * Secure: redacts sensitive keys to prevent secret leakage.
 */

/** Keys that must never appear in logs. Values replaced with "[REDACTED]". */
const SENSITIVE_KEYS = new Set([
  "password",
  "secret",
  "token",
  "authorization",
  "cookie",
  "apiKey",
  "api_key",
  "privateKey",
  "private_key",
  "credential",
  "jwt",
]);

export interface LoggerContext {
  correlationId?: string;
  requestId?: string;
  partyId?: string;
  userId?: string;
  dealId?: string;
  operation?: string;
  [key: string]: unknown;
}

export interface StructuredLogger {
  info(message: string, context?: LoggerContext): void;
  warn(message: string, context?: LoggerContext): void;
  error(message: string, error?: unknown, context?: LoggerContext): void;
  debug(message: string, context?: LoggerContext): void;
  child(service: string, baseContext?: LoggerContext): StructuredLogger;
}

function serializeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function redact(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const lower = k.toLowerCase();
    if (SENSITIVE_KEYS.has(lower) || lower.includes("secret") || lower.includes("password")) {
      out[k] = "[REDACTED]";
    } else if (v != null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      out[k] = redact(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function formatLog(level: string, service: string, message: string, context?: LoggerContext, err?: unknown): string {
  const payload: Record<string, unknown> = {
    level,
    service,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  if (err !== undefined) payload["error"] = serializeError(err);
  return JSON.stringify(redact(payload));
}

export function createStructuredLogger(service: string, baseContext?: LoggerContext): StructuredLogger {
  const log = (level: string) => (message: string, ctx?: LoggerContext, err?: unknown) => {
    const out = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    out(formatLog(level, service, message, { ...baseContext, ...ctx }, err));
  };

  return {
    info: (msg, ctx) => log("info")(msg, ctx),
    warn: (msg, ctx) => log("warn")(msg, ctx),
    error: (msg, err, ctx) => log("error")(msg, ctx, err),
    debug: (msg, ctx) => log("debug")(msg, ctx),
    child: (childService, childContext) =>
      createStructuredLogger(`${service}:${childService}`, { ...baseContext, ...childContext }),
  };
}
