import { describe, it, expect } from "vitest";
import {
  SwapEngine,
  InMemorySwapEngineStore,
  SwapEngineEventEmitter,
} from "./index.js";

const partyA = "partyA::1220" + "a".repeat(64);
const partyB = "partyB::1220" + "b".repeat(64);
const cnt = { admin: "DSO::1220" + "c".repeat(64), symbol: "CNT" };
const cbtc = { admin: "DSO::1220" + "d".repeat(64), symbol: "CBTC" };

describe("SwapEngine", () => {
  it("full quote-to-settlement flow", async () => {
    const store = new InMemorySwapEngineStore();
    const engine = new SwapEngine({ store });

    // Amounts must be integer strings (smallest units); BigInt does not support decimals
    const request = await engine.requestQuote(
      partyA,
      partyB,
      cnt,
      "100",
      cbtc,
      "1000",
      60_000
    );
    expect(request.id).toBeDefined();
    expect(request.requester).toBe(partyA);
    expect(request.counterparty).toBe(partyB);

    const response = await engine.respondToQuote(
      request.id,
      partyB,
      cbtc,
      "1000",
      cnt,
      "100"
    );
    expect(response.requestId).toBe(request.id);

    const { deal } = await engine.acceptQuote(response.id, partyA);
    expect(deal.state).toBe("accepted");
    // giveLeg = requester gives CNT 100; receiveLeg = counterparty gives CBTC 1000
    expect(deal.giveLeg.amount).toBe("100");
    expect(deal.receiveLeg.amount).toBe("1000");

    await engine.recordPreCheck(deal.id, "balance", true);
    await engine.recordPreCheck(deal.id, "approval", true);
    await engine.dealService.transition(deal.id, "pre_checks_passed");

    await engine.recordApproval(deal.id, "give-leg", partyB, "approved");
    await engine.recordApproval(deal.id, "receive-leg", partyA, "approved");
    await engine.dealService.transition(deal.id, "approvals_complete");

    const instruction = await engine.createSettlementInstruction(deal.id);
    expect(instruction.settlement.legs).toHaveLength(4);
    expect(instruction.dealId).toBe(deal.id);

    const confirmed = await engine.confirmSettlement(deal.id);
    expect(confirmed.state).toBe("settled");
  });

  it("emits events", async () => {
    const store = new InMemorySwapEngineStore();
    const events = new SwapEngineEventEmitter();
    const emitted: string[] = [];
    events.on("quote_requested", () => emitted.push("quote_requested"));
    events.on("quote_responded", () => emitted.push("quote_responded"));
    events.on("quote_accepted", () => emitted.push("quote_accepted"));

    const engine = new SwapEngine({ store, events });
    const request = await engine.requestQuote(partyA, partyB, cnt, "10", cbtc, "100");
    const response = await engine.respondToQuote(request.id, partyB, cbtc, "100", cnt, "10");
    await engine.acceptQuote(response.id, partyA);

    expect(emitted).toContain("quote_requested");
    expect(emitted).toContain("quote_responded");
    expect(emitted).toContain("quote_accepted");
  });

  it("rejects quote", async () => {
    const store = new InMemorySwapEngineStore();
    const engine = new SwapEngine({ store });
    const request = await engine.requestQuote(partyA, partyB, cnt, "10", cbtc, "100");
    const response = await engine.respondToQuote(request.id, partyB, cbtc, "100", cnt, "10");

    const decision = await engine.rejectQuote(response.id, partyA, "Terms not acceptable");
    expect(decision.outcome).toBe("rejected");
    expect(decision.reason).toBe("Terms not acceptable");
  });

  it("cancels deal", async () => {
    const store = new InMemorySwapEngineStore();
    const engine = new SwapEngine({ store });
    const request = await engine.requestQuote(partyA, partyB, cnt, "10", cbtc, "100");
    const response = await engine.respondToQuote(request.id, partyB, cbtc, "100", cnt, "10");
    const { deal } = await engine.acceptQuote(response.id, partyA);

    const cancelled = await engine.cancelDeal(deal.id);
    expect(cancelled.state).toBe("cancelled");
  });
});
