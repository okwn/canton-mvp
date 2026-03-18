/**
 * Canton Scan API client.
 */

import type { CantonConfig } from "@canton-mvp/shared-types";
import type { ScanList, TransferRegistryInfo } from "@canton-mvp/shared-types";
import { fetchWithRetry } from "@canton-mvp/canton-client";
import type { FetchOptions } from "@canton-mvp/canton-client";
import { normalizeScansResponse } from "./normalize.js";
import type { RawScansResponse } from "./types.js";

export interface ScanClientConfig {
  baseUrl: string;
  authToken?: string;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onRequest?: (url: string, init: RequestInit) => void;
  onResponse?: (url: string, status: number, durationMs: number) => void;
}

export class ScanClient {
  private readonly config: ScanClientConfig;
  private readonly fetchOptions: FetchOptions;

  constructor(config: ScanClientConfig) {
    this.config = config;
    this.fetchOptions = {
      baseUrl: config.baseUrl,
      ...(config.authToken !== undefined && { authToken: config.authToken }),
      timeoutMs: config.timeoutMs ?? 30_000,
      retries: config.retries ?? 3,
      retryDelayMs: config.retryDelayMs ?? 1000,
      ...(config.onRetry !== undefined && { onRetry: config.onRetry }),
      ...(config.onRequest !== undefined && { onRequest: config.onRequest }),
      ...(config.onResponse !== undefined && { onResponse: config.onResponse }),
    };
  }

  static fromConfig(cantonConfig: CantonConfig, authToken?: string): ScanClient {
    const url = cantonConfig.scanApiUrl ?? "http://scan.localhost:4000";
    return new ScanClient({
      baseUrl: url,
      ...(authToken !== undefined && authToken !== "" && { authToken }),
    });
  }

  /** Inspect scans (list of scan services). */
  async getScans(): Promise<ScanList> {
    const res = await this.request("GET", "/api/scan/v0/scans");
    const raw = (await res.json()) as RawScansResponse;
    return normalizeScansResponse(raw);
  }

  /** Get network/synchronizer metadata from scans. */
  async getNetworkMetadata(): Promise<ScanList> {
    return this.getScans();
  }

  /** Get transfer registry info (transfer factory URL for token flows). */
  getTransferRegistryInfo(): TransferRegistryInfo {
    const base = this.config.baseUrl.replace(/\/$/, "");
    return {
      transferFactoryUrl: `${base}/registry/transfer-instruction/v1/transfer-factory`,
    };
  }

  private async request(method: string, path: string): Promise<Response> {
    return fetchWithRetry(path, { method }, this.fetchOptions);
  }
}
