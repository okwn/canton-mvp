/**
 * Settlement leg representation.
 * Enables multi-leg atomic settlement (swaps, DvP).
 */

import type { PartyId } from "@canton-mvp/shared-types";
import type { TokenInstrumentId } from "./registry.js";

/** Direction of a settlement leg. */
export type SettlementLegDirection = "debit" | "credit";

/** Single leg of a multi-leg settlement. */
export interface SettlementLeg {
  party: PartyId;
  instrumentId: TokenInstrumentId;
  amount: string;
  direction: SettlementLegDirection;
  /** Optional reference for correlation. */
  legId?: string;
}

/** Multi-leg settlement (e.g. swap, DvP). */
export interface Settlement {
  legs: SettlementLeg[];
  /** Optional id for atomic grouping. */
  settlementId?: string;
}
