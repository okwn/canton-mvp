/**
 * Canton JSON Ledger API v2 types.
 * Based on OpenAPI spec; Daml values use JSON encoding.
 */

/** Create a new contract. */
export interface CreateCommand {
  CreateCommand: {
    templateId: string;
    createArguments: Record<string, unknown>;
  };
}

/** Exercise a choice on an existing contract. */
export interface ExerciseCommand {
  ExerciseCommand: {
    templateId: string;
    contractId: string;
    choice: string;
    choiceArgument: Record<string, unknown>;
  };
}

/** Create and exercise in one transaction. */
export interface CreateAndExerciseCommand {
  CreateAndExerciseCommand: {
    templateId: string;
    createArguments: Record<string, unknown>;
    choice: string;
    choiceArgument: Record<string, unknown>;
  };
}

export type Command = CreateCommand | ExerciseCommand | CreateAndExerciseCommand;

/** Composite command for submit-and-wait. */
export interface JsCommands {
  commandId: string;
  commands: Command[];
  actAs: string[];
  userId?: string;
  readAs?: string[];
  workflowId?: string;
}

/** Submit-and-wait response (completion details). */
export interface SubmitAndWaitResponse {
  completions: Array<{
    commandId: string;
    status?: { status: string };
    updateId?: string;
    offset?: string;
  }>;
}

/** Submit-and-wait-for-transaction request. */
export type JsSubmitAndWaitForTransactionRequest = JsCommands;

/** Submit-and-wait-for-transaction response. */
export interface JsSubmitAndWaitForTransactionResponse {
  transaction?: {
    commandId: string;
    effectiveAt: string;
    events: Array<CreatedEvent | ExercisedEvent>;
    offset: string;
  };
}

export interface CreatedEvent {
  contractId: string;
  templateId: string;
  createArgument: Record<string, unknown>;
  signatories: string[];
  observers?: string[];
  [key: string]: unknown;
}

export interface ExercisedEvent {
  contractId: string;
  templateId: string;
  choice: string;
  choiceArgument: Record<string, unknown>;
  exerciseResult?: unknown;
  consuming: boolean;
  [key: string]: unknown;
}

/** Get events by contract ID request. */
export interface GetEventsByContractIdRequest {
  contractId: string;
  requestingParties: string[];
}

/** Get events by contract ID response. */
export interface JsGetEventsByContractIdResponse {
  events: Array<CreatedEvent | ExercisedEvent>;
}

/** Get active contracts request. */
export interface GetActiveContractsRequest {
  filter?: {
    inclusive?: {
      templateIds?: string[];
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  requestingParties: string[];
  offset?: string;
}

/** Active contract in response. */
export interface ActiveContract {
  contractId: string;
  templateId: string;
  createArgument: Record<string, unknown>;
  signatories: string[];
  observers?: string[];
  [key: string]: unknown;
}

export interface JsGetActiveContractsResponse {
  offset?: string;
  activeContracts: ActiveContract[];
}

/** Completion stream request (for polling). */
export interface CompletionStreamRequest {
  parties: string[];
  userId?: string;
  beginExclusive?: string;
}

/** Completion stream response item. */
export interface CompletionStreamResponse {
  Completion?: {
    commandId: string;
    status?: { status: string };
    updateId?: string;
    offset?: string;
  };
}

/** Version response. */
export interface GetLedgerApiVersionResponse {
  version: string;
}
