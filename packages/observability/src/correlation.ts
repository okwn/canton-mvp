/**
 * Correlation ID utilities for tracing across wallet, API, and ledger.
 */

import { randomUUID } from "crypto";

export const CORRELATION_HEADER = "x-correlation-id";

/**
 * Generate a new correlation ID (UUID v4).
 */
export function createCorrelationId(): string {
  return randomUUID();
}

/**
 * Extract correlation ID from headers or generate new one.
 */
export function getOrCreateCorrelationId(headers?: Record<string, string | undefined>): string {
  const existing = headers?.[CORRELATION_HEADER] ?? headers?.["x-request-id"];
  if (existing && typeof existing === "string") return existing;
  return createCorrelationId();
}
