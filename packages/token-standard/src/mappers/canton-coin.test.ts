import { describe, it, expect } from "vitest";
import { mapCantonCoinHoldingToHolding } from "./canton-coin.js";

describe("canton-coin mapper", () => {
  it("maps raw holding to Holding", () => {
    const raw = {
      contractId: "c1",
      owner: "party::1220" + "a".repeat(64),
      instrumentId: { admin: "DSO::1220" + "b".repeat(64), symbol: "CNT" },
      amount: "100",
    };
    const holding = mapCantonCoinHoldingToHolding(raw);
    expect(holding.instrumentId.admin).toBe(raw.instrumentId?.admin);
    expect(holding.instrumentId.symbol).toBe("CNT");
    expect(holding.amount).toBe("100");
    expect(holding.contractId).toBe("c1");
    expect(holding.owner).toBe(raw.owner);
  });

  it("handles missing fields", () => {
    const holding = mapCantonCoinHoldingToHolding({});
    expect(holding.instrumentId.admin).toBe("");
    expect(holding.instrumentId.symbol).toBe("");
    expect(holding.amount).toBe("0");
  });
});
