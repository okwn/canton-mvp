/**
 * Connection session model.
 * Tracks active wallet/validator sessions.
 */

import type { PartyId } from "@canton-mvp/shared-types";

export interface ConnectionSession {
  id: string;
  userId: string;
  partyId: PartyId;
  /** Session source. */
  source: "validator" | "wallet";
  /** Expiry (ms since epoch). */
  expiresAt: number;
  createdAt: number;
}
