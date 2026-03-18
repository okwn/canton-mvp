import { describe, it, expect } from "vitest";
import {
  DSO_PARTY,
  ALICE_PARTY,
  BOB_PARTY,
  INSTRUMENT_USD,
  INSTRUMENT_EUR,
  CREATE_QUOTE_REQUEST,
  EXERCISE_FINALIZE_SWAP,
  SUBMIT_AND_WAIT_COMMANDS,
} from "./daml-payloads.js";

describe("daml-payloads fixtures", () => {
  it("exports party constants", () => {
    expect(DSO_PARTY).toMatch(/^DSO::1220/);
    expect(ALICE_PARTY).toMatch(/^Alice::1220/);
    expect(BOB_PARTY).toMatch(/^Bob::1220/);
  });

  it("exports instrument fixtures", () => {
    expect(INSTRUMENT_USD.admin).toBe(DSO_PARTY);
    expect(INSTRUMENT_USD.symbol).toBe("USD");
    expect(INSTRUMENT_EUR.symbol).toBe("EUR");
  });

  it("CREATE_QUOTE_REQUEST has CreateCommand shape", () => {
    const cmd = CREATE_QUOTE_REQUEST as { CreateCommand: { templateId: string; createArguments: Record<string, unknown> } };
    expect(cmd).toHaveProperty("CreateCommand");
    expect(cmd.CreateCommand.templateId).toContain("QuoteRequest");
    expect(cmd.CreateCommand.createArguments["requester"]).toBe(ALICE_PARTY);
    expect(cmd.CreateCommand.createArguments["giveAmount"]).toBe("100");
  });

  it("EXERCISE_FINALIZE_SWAP has ExerciseCommand shape", () => {
    const cmd = EXERCISE_FINALIZE_SWAP as { ExerciseCommand: { choice: string } };
    expect(cmd).toHaveProperty("ExerciseCommand");
    expect(cmd.ExerciseCommand.choice).toBe("FinalizeSwap");
  });

  it("SUBMIT_AND_WAIT_COMMANDS has commandId and actAs", () => {
    expect(SUBMIT_AND_WAIT_COMMANDS.commandId).toBeDefined();
    expect(SUBMIT_AND_WAIT_COMMANDS.actAs).toContain(ALICE_PARTY);
    expect(SUBMIT_AND_WAIT_COMMANDS.commands).toHaveLength(1);
  });
});
