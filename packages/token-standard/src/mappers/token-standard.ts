/**
 * Normalization mapper for CIP-0056 token-standard assets.
 * Future-proof for assets beyond Canton Coin.
 */

import type { Holding, TokenInstrumentId } from "../interfaces/index.js";

/** Raw CIP-0056 compliant holding (generic shape). */
export interface TokenStandardHoldingRaw {
  contractId?: string;
  owner?: string;
  instrumentId?: { admin?: string; symbol?: string } | { admin?: string; id?: string };
  amount?: string;
}

/** Normalize instrumentId: CIP-0056 may use 'id' or 'symbol'. */
function normalizeInstrumentId(
  raw: TokenStandardHoldingRaw["instrumentId"]
): TokenInstrumentId {
  if (!raw) return { admin: "", symbol: "" };
  const admin = raw.admin ?? "";
  const symbol = "symbol" in raw ? (raw.symbol ?? "") : ("id" in raw ? (raw.id ?? "") : "");
  return { admin, symbol };
}

/** Map token-standard holding to app-facing Holding. */
export function mapTokenStandardHoldingToHolding(
  raw: TokenStandardHoldingRaw
): Holding {
  const instrumentId = normalizeInstrumentId(raw.instrumentId);
  return {
    instrumentId,
    amount: raw.amount ?? "0",
    ...(raw.contractId !== undefined && { contractId: raw.contractId }),
    ...(raw.owner !== undefined && { owner: raw.owner }),
  };
}

/** Map array of token-standard holdings. */
export function mapTokenStandardHoldings(raw: TokenStandardHoldingRaw[]): Holding[] {
  return raw.map(mapTokenStandardHoldingToHolding);
}
