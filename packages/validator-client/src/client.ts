/**
 * Canton Validator API client.
 */

import type { CantonConfig } from "@canton-mvp/shared-types";
import type { ValidatorUserInfo, DsoPartyInfo } from "@canton-mvp/shared-types";
import { fetchWithRetry } from "@canton-mvp/canton-client";
import type { FetchOptions } from "@canton-mvp/canton-client";
import { normalizeValidatorUser, normalizeDsoPartyId } from "./normalize.js";
import type { RawValidatorUser, RawDsoPartyIdResponse } from "./types.js";

export interface ValidatorClientConfig {
  baseUrl: string;
  authToken?: string;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onRequest?: (url: string, init: RequestInit) => void;
  onResponse?: (url: string, status: number, durationMs: number) => void;
}

export class ValidatorClient {
  private readonly fetchOptions: FetchOptions;

  constructor(config: ValidatorClientConfig) {
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

  static fromConfig(cantonConfig: CantonConfig, authToken?: string): ValidatorClient {
    const url =
      cantonConfig.validatorApiUrl ??
      cantonConfig.ledgerApiUrl.replace(/:97\d$/, ":903").replace(/:2975$/, ":2903");
    return new ValidatorClient({
      baseUrl: url,
      ...(authToken !== undefined && authToken !== "" && { authToken }),
    });
  }

  /** Fetch validator user data (authenticated user). */
  async getValidatorUser(): Promise<ValidatorUserInfo> {
    const res = await this.request("GET", "/api/validator/v0/validator-user");
    const raw = (await res.json()) as RawValidatorUser;
    return normalizeValidatorUser(raw);
  }

  /** Resolve DSO party ID. Uses scan-proxy endpoint (BFT proxy to Scan). */
  async getDsoPartyId(): Promise<DsoPartyInfo> {
    const res = await this.request("GET", "/api/validator/v0/scan-proxy/dso-party-id");
    const raw = (await res.json()) as RawDsoPartyIdResponse;
    return normalizeDsoPartyId(raw);
  }

  /** Resolve validator party metadata (DSO + validator user). */
  async getValidatorPartyMetadata(): Promise<{
    validatorUser: ValidatorUserInfo;
    dsoParty: DsoPartyInfo;
  }> {
    const [validatorUser, dsoParty] = await Promise.all([
      this.getValidatorUser(),
      this.getDsoPartyId(),
    ]);
    return { validatorUser, dsoParty };
  }

  private async request(method: string, path: string): Promise<Response> {
    return fetchWithRetry(path, { method }, this.fetchOptions);
  }
}
