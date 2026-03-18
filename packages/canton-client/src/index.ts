/**
 * @canton-mvp/canton-client
 *
 * Typed client for Canton JSON Ledger API v2.
 */

export { CantonLedgerClient } from "./client.js";
export type { CantonClientConfig } from "./client.js";
export {
  createCommand,
  exerciseCommand,
  createAndExerciseCommand,
  buildCommands,
  generateCommandId,
  templateId,
} from "./commands.js";
export {
  CantonClientError,
  CantonTimeoutError,
  CantonNetworkError,
} from "./errors.js";
export type { CantonErrorPayload } from "./errors.js";
export { fetchWithRetry } from "./fetch.js";
export type { FetchOptions } from "./fetch.js";
export type {
  CreateCommand,
  ExerciseCommand,
  CreateAndExerciseCommand,
  Command,
  JsCommands,
  SubmitAndWaitResponse,
  JsSubmitAndWaitForTransactionResponse,
  GetEventsByContractIdRequest,
  JsGetEventsByContractIdResponse,
  GetActiveContractsRequest,
  JsGetActiveContractsResponse,
  ActiveContract,
  CreatedEvent,
  ExercisedEvent,
  CompletionStreamRequest,
  CompletionStreamResponse,
  GetLedgerApiVersionResponse,
} from "./types.js";
