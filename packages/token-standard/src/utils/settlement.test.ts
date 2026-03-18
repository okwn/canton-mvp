import { describe, it, expect } from "vitest";
import {
  swapLegs,
  composeSettlement,
  isSettlementBalanced,
  aggregateHoldingsToBalances,
} from "./settlement.js";

describe("settlement utils", () => {
  const partyA = "partyA::1220" + "a".repeat(64);
  const partyB = "partyB::1220" + "b".repeat(64);
  const cnt = { admin: "DSO::1220" + "c".repeat(64), symbol: "CNT" };
  const cbtc = { admin: "DSO::1220" + "d".repeat(64), symbol: "CBTC" };

  it("swapLegs creates balanced 4-leg settlement", () => {
    // Amounts must be integer strings (smallest units); BigInt does not support decimals
    const legs = swapLegs(partyA, cnt, "100", partyB, cbtc, "1000");
    expect(legs).toHaveLength(4);
    const settlement = composeSettlement(legs);
    expect(isSettlementBalanced(settlement)).toBe(true);
  });

  it("aggregateHoldingsToBalances sums by instrument", () => {
    const holdings = [
      { instrumentId: cnt, amount: "50", contractId: "c1" },
      { instrumentId: cnt, amount: "30", contractId: "c2" },
      { instrumentId: cbtc, amount: "1", contractId: "c3" },
    ];
    const balances = aggregateHoldingsToBalances(holdings);
    expect(balances).toHaveLength(2);
    const cntBalance = balances.find((b) => b.instrumentId.symbol === "CNT");
    expect(cntBalance?.amount).toBe("80");
    expect(cntBalance?.totalHoldings).toBe(2);
  });
});
