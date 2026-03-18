/**
 * Canton party model.
 * Ledger identity with metadata.
 */

import type { PartyId } from "@canton-mvp/shared-types";

export interface CantonParty {
  partyId: PartyId;
  /** App user id this party is linked to. */
  userId: string;
  /** Display name or label. */
  displayName?: string;
  /** Source: validator-allocated, wallet-external, etc. */
  source: "validator" | "wallet" | "manual";
  /** Optional network/synchronizer context. */
  networkId?: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}
