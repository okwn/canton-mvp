/**
 * Fetch with retry, timeout, and auth.
 * Uses native fetch (Node 18+ or browser).
 */

import { CantonTimeoutError, CantonNetworkError, CantonClientError } from "./errors.js";

export interface FetchOptions {
  baseUrl: string;
  authToken?: string;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, error: Error) => void;
  onRequest?: (url: string, init: RequestInit) => void;
  onResponse?: (url: string, status: number, durationMs: number) => void;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;
const DEFAULT_RETRYABLE_STATUSES = [429, 503, 504];

export async function fetchWithRetry(
  path: string,
  init: RequestInit,
  options: FetchOptions
): Promise<Response> {
  const {
    baseUrl,
    authToken,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    retryableStatuses = DEFAULT_RETRYABLE_STATUSES,
    onRetry,
    onRequest,
    onResponse,
  } = options;

  const url = new URL(path, baseUrl).toString();
  const headers = new Headers(init?.headers);
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }
  headers.set("Content-Type", "application/json");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const doFetch = async (): Promise<Response> => {
    const start = Date.now();
    onRequest?.(url, { ...init, headers, signal: controller.signal });

    try {
      const res = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      });
      onResponse?.(url, res.status, Date.now() - start);

      if (!res.ok) {
        const body = await res.text();
        const err = CantonClientError.fromResponse(res.status, body);
        if (retryableStatuses.includes(res.status) && err.retryable) {
          throw err;
        }
        throw err;
      }
      return res;
    } catch (e) {
      if (e instanceof CantonClientError) {
        throw e;
      }
      if (e instanceof Error) {
        if (e.name === "AbortError") {
          throw new CantonTimeoutError(`Request timed out after ${timeoutMs}ms`);
        }
        throw new CantonNetworkError(e.message, e);
      }
      throw e;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await doFetch();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      const isRetryable =
        e instanceof CantonClientError && e.retryable && attempt < retries;
      if (!isRetryable) {
        throw e;
      }
      onRetry?.(attempt + 1, lastError);
      await sleep(retryDelayMs * Math.pow(2, attempt));
    }
  }
  throw lastError ?? new CantonNetworkError("Request failed");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
