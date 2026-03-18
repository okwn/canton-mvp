/**
 * Multi-leg settlement composition utilities.
 * Supports swaps, DvP, and atomic multi-asset flows.
 */

import type { PartyId } from "@canton-mvp/shared-types";
import type { Holding, Balance } from "../interfaces/holdings.js";
import type { TokenInstrumentId } from "../interfaces/registry.js";
import type { SettlementLeg, Settlement } from "../interfaces/settlement.js";

/** Create a single debit leg (party gives tokens). */
export function debitLeg(
  party: PartyId,
  instrumentId: TokenInstrumentId,
  amount: string,
  legId?: string
): SettlementLeg {
  return { party, instrumentId, amount, direction: "debit", ...(legId !== undefined && { legId }) };
}

/** Create a single credit leg (party receives tokens). */
export function creditLeg(
  party: PartyId,
  instrumentId: TokenInstrumentId,
  amount: string,
  legId?: string
): SettlementLeg {
  return { party, instrumentId, amount, direction: "credit", ...(legId !== undefined && { legId }) };
}

/** Create a simple swap: partyA gives instrumentA to partyB, partyB gives instrumentB to partyA. */
export function swapLegs(
  partyA: PartyId,
  instrumentA: TokenInstrumentId,
  amountA: string,
  partyB: PartyId,
  instrumentB: TokenInstrumentId,
  amountB: string
): SettlementLeg[] {
  return [
    debitLeg(partyA, instrumentA, amountA, "swap-a-debit"),
    creditLeg(partyB, instrumentA, amountA, "swap-a-credit"),
    debitLeg(partyB, instrumentB, amountB, "swap-b-debit"),
    creditLeg(partyA, instrumentB, amountB, "swap-b-credit"),
  ];
}

/** Compose legs into a Settlement. */
export function composeSettlement(
  legs: SettlementLeg[],
  settlementId?: string
): Settlement {
  return { legs, ...(settlementId !== undefined && { settlementId }) };
}

/** Group legs by instrument for balance check. */
function legsByInstrument(legs: SettlementLeg[]): Map<string, { debit: string; credit: string }> {
  const byKey = new Map<string, { debit: string; credit: string }>();
  const key = (i: TokenInstrumentId) => `${i.admin}::${i.symbol}`;

  for (const leg of legs) {
    const k = key(leg.instrumentId);
    let entry = byKey.get(k);
    if (!entry) {
      entry = { debit: "0", credit: "0" };
      byKey.set(k, entry);
    }
    if (leg.direction === "debit") {
      entry.debit = addAmounts(entry.debit, leg.amount);
    } else {
      entry.credit = addAmounts(entry.credit, leg.amount);
    }
  }
  return byKey;
}

/**
 * Simple string amount addition.
 * IMPORTANT: Amounts must be integer strings (smallest units, e.g. satoshis).
 * BigInt does not support decimals; use a decimal library for fractional amounts.
 */
function addAmounts(a: string, b: string): string {
  const x = BigInt(a);
  const y = BigInt(b);
  return String(x + y);
}

/** Validate that debits equal credits per instrument (balanced settlement). */
export function isSettlementBalanced(settlement: Settlement): boolean {
  const byInstrument = legsByInstrument(settlement.legs);
  for (const [, { debit, credit }] of byInstrument) {
    if (debit !== credit) return false;
  }
  return true;
}

/** Aggregate holdings into balances by instrument. */
export function aggregateHoldingsToBalances(holdings: Holding[]): Balance[] {
  const byKey = new Map<
    string,
    { instrumentId: { admin: string; symbol: string }; amount: bigint; totalHoldings: number }
  >();
  const key = (admin: string, symbol: string) => `${admin}::${symbol}`;

  for (const h of holdings) {
    const k = key(h.instrumentId.admin, h.instrumentId.symbol);
    const existing = byKey.get(k);
    const amount = BigInt(h.amount);
    if (existing) {
      existing.amount += amount;
      existing.totalHoldings += 1;
    } else {
      byKey.set(k, {
        instrumentId: h.instrumentId,
        amount,
        totalHoldings: 1,
      });
    }
  }

  return Array.from(byKey.values()).map((v) => ({
    instrumentId: v.instrumentId,
    amount: String(v.amount),
    totalHoldings: v.totalHoldings,
  }));
}
