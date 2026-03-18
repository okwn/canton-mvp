import { describe, it, expect } from "vitest";
import {
  transferIntentSchema,
  settlementSchema,
  holdingSchema,
} from "./index.js";

describe("schemas", () => {
  it("validates TransferIntent", () => {
    const valid = {
      from: "party::1220" + "a".repeat(64),
      to: "party::1220" + "b".repeat(64),
      instrumentId: { admin: "DSO::1220" + "c".repeat(64), symbol: "CNT" },
      amount: "100",
    };
    expect(transferIntentSchema.parse(valid)).toEqual(valid);
    expect(() =>
      transferIntentSchema.parse({ ...valid, from: "" })
    ).toThrow();
  });

  it("validates Settlement", () => {
    const legs = [
      { party: "p1", instrumentId: { admin: "a", symbol: "s" }, amount: "10", direction: "debit" as const },
      { party: "p2", instrumentId: { admin: "a", symbol: "s" }, amount: "10", direction: "credit" as const },
    ];
    const settlement = settlementSchema.parse({ legs });
    expect(settlement.legs).toHaveLength(2);
  });

  it("validates Holding", () => {
    const holding = { instrumentId: { admin: "a", symbol: "s" }, amount: "50" };
    expect(holdingSchema.parse(holding)).toEqual(holding);
  });
});
