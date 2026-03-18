/**
 * Normalization mapper for Canton Coin-like assets.
 * Maps raw ledger contract shapes to app-facing types.
 */

import type { Holding, TokenInstrumentId } from "../interfaces/index.js";

/** Raw Canton Coin holding contract (typical shape). */
export interface CantonCoinHoldingRaw {
  contractId?: string;
  owner?: string;
  instrumentId?: { admin?: string; symbol?: string };
  amount?: string;
}

/** Map Canton Coin holding to app-facing Holding. */
export function mapCantonCoinHoldingToHolding(raw: CantonCoinHoldingRaw): Holding {
  const admin = raw.instrumentId?.admin ?? "";
  const symbol = raw.instrumentId?.symbol ?? "";
  const instrumentId: TokenInstrumentId = { admin, symbol };
  return {
    instrumentId,
    amount: raw.amount ?? "0",
    ...(raw.contractId !== undefined && { contractId: raw.contractId }),
    ...(raw.owner !== undefined && { owner: raw.owner }),
  };
}

/** Map array of Canton Coin holdings. */
export function mapCantonCoinHoldings(raw: CantonCoinHoldingRaw[]): Holding[] {
  return raw.map(mapCantonCoinHoldingToHolding);
}
