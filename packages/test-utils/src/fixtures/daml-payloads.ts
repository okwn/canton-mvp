/**
 * Sample Daml payload fixtures for tests.
 * Matches Canton JSON Ledger API v2 encoding.
 */

export const DSO_PARTY = "DSO::1220" + "b".repeat(64);
export const ALICE_PARTY = "Alice::1220" + "a".repeat(64);
export const BOB_PARTY = "Bob::1220" + "c".repeat(64);

/** InstrumentId (Types.InstrumentId) */
export const INSTRUMENT_USD = {
  admin: DSO_PARTY,
  symbol: "USD",
};

export const INSTRUMENT_EUR = {
  admin: DSO_PARTY,
  symbol: "EUR",
};

/** CreateCommand for a simple contract */
export const CREATE_QUOTE_REQUEST = {
  CreateCommand: {
    templateId: "CantonMvp:QuoteRequest:QuoteRequest",
    createArguments: {
      requester: ALICE_PARTY,
      counterparty: BOB_PARTY,
      giveInstrument: INSTRUMENT_USD,
      giveAmount: "100",
      receiveInstrument: INSTRUMENT_EUR,
      receiveAmount: "95",
      status: "Pending",
    },
  },
};

/** ExerciseCommand for FinalizeSwap on SettlementInstruction */
export const EXERCISE_FINALIZE_SWAP = {
  ExerciseCommand: {
    templateId: "CantonMvp:SettlementInstruction:SettlementInstruction",
    contractId: "#contract-id-placeholder",
    choice: "FinalizeSwap",
    choiceArgument: {},
  },
};

/** JsCommands for submit-and-wait */
export const SUBMIT_AND_WAIT_COMMANDS = {
  commandId: "test-cmd-" + Date.now(),
  commands: [CREATE_QUOTE_REQUEST],
  actAs: [ALICE_PARTY],
};
