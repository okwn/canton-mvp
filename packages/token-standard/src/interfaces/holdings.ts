/**
 * Holdings and balances interfaces.
 * App-facing, protocol-agnostic.
 */

import type { PartyId } from "@canton-mvp/shared-types";
import type { TokenInstrumentId } from "./registry.js";

/** Single holding (balance view for UI / portfolio). */
export interface Holding {
  instrumentId: TokenInstrumentId;
  amount: string;
  /** Optional contract reference for ledger operations. */
  contractId?: string;
  /** Owner party (for multi-party views). */
  owner?: PartyId;
}

/** Aggregated balance for an instrument. */
export interface Balance {
  instrumentId: TokenInstrumentId;
  amount: string;
  /** Sum of all holdings for this instrument. */
  totalHoldings?: number;
}
