/**
 * Canton JSON Ledger API v2 client.
 */

import type { CantonConfig } from "@canton-mvp/shared-types";
import {
  fetchWithRetry,
  type FetchOptions,
} from "./fetch.js";
import type {
  GetLedgerApiVersionResponse,
  SubmitAndWaitResponse,
  JsSubmitAndWaitForTransactionResponse,
  GetEventsByContractIdRequest,
  JsGetEventsByContractIdResponse,
  GetActiveContractsRequest,
  JsGetActiveContractsResponse,
  CompletionStreamRequest,
  CompletionStreamResponse,
  JsCommands,
} from "./types.js";
import {
  createCommand,
  exerciseCommand,
  createAndExerciseCommand,
  buildCommands,
  generateCommandId,
} from "./commands.js";
import type { CreateCommand, ExerciseCommand, CreateAndExerciseCommand } from "./types.js";

export interface CantonClientConfig {
  baseUrl: string;
  authToken?: string;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onRequest?: (url: string, init: RequestInit) => void;
  onResponse?: (url: string, status: number, durationMs: number) => void;
}

export class CantonLedgerClient {
  private readonly fetchOptions: FetchOptions;

  constructor(config: CantonClientConfig) {
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

  static fromConfig(cantonConfig: CantonConfig, authToken?: string): CantonLedgerClient {
    return new CantonLedgerClient({
      baseUrl: cantonConfig.ledgerApiUrl,
      ...(authToken !== undefined && authToken !== "" && { authToken }),
    });
  }

  /** GET /v2/version */
  async getVersion(): Promise<GetLedgerApiVersionResponse> {
    const res = await this.request("GET", "/v2/version");
    return (await res.json()) as GetLedgerApiVersionResponse;
  }

  /** POST /v2/commands/submit-and-wait */
  async submitAndWait(commands: JsCommands): Promise<SubmitAndWaitResponse> {
    const res = await this.request("POST", "/v2/commands/submit-and-wait", commands);
    return (await res.json()) as SubmitAndWaitResponse;
  }

  /** POST /v2/commands/submit-and-wait-for-transaction */
  async submitAndWaitForTransaction(
    commands: JsCommands
  ): Promise<JsSubmitAndWaitForTransactionResponse> {
    const res = await this.request(
      "POST",
      "/v2/commands/submit-and-wait-for-transaction",
      commands
    );
    return (await res.json()) as JsSubmitAndWaitForTransactionResponse;
  }

  /** POST /v2/events/events-by-contract-id */
  async getEventsByContractId(
    request: GetEventsByContractIdRequest
  ): Promise<JsGetEventsByContractIdResponse> {
    const res = await this.request("POST", "/v2/events/events-by-contract-id", request);
    return (await res.json()) as JsGetEventsByContractIdResponse;
  }

  /** POST /v2/state/active-contracts */
  async getActiveContracts(
    request: GetActiveContractsRequest
  ): Promise<JsGetActiveContractsResponse[]> {
    const res = await this.request("POST", "/v2/state/active-contracts", request);
    return (await res.json()) as JsGetActiveContractsResponse[];
  }

  /** POST /v2/commands/completions (blocking poll). */
  async getCompletions(
    request: CompletionStreamRequest,
    params?: { limit?: number; streamIdleTimeoutMs?: number }
  ): Promise<CompletionStreamResponse[]> {
    const query = new URLSearchParams();
    if (params?.limit != null) query.set("limit", String(params.limit));
    if (params?.streamIdleTimeoutMs != null) {
      query.set("stream_idle_timeout_ms", String(params.streamIdleTimeoutMs));
    }
    const path = `/v2/commands/completions${query.toString() ? `?${query}` : ""}`;
    const res = await this.request("POST", path, request);
    return (await res.json()) as CompletionStreamResponse[];
  }

  private async request(
    method: string,
    path: string,
    body?: unknown
  ): Promise<Response> {
    const init: RequestInit = { method };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }
    return fetchWithRetry(path, init, this.fetchOptions);
  }

  // --- Command builder helpers (re-export for convenience) ---

  create = createCommand;
  exercise = exerciseCommand;
  createAndExercise = createAndExerciseCommand;
  buildCommands = buildCommands;
  generateCommandId = generateCommandId;
}

export type { CreateCommand, ExerciseCommand, CreateAndExerciseCommand };
