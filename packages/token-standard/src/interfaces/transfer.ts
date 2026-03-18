/**
 * Transfer intent and approval interfaces.
 * Supports single-leg and multi-leg (DvP, swap) workflows.
 */

import type { PartyId } from "@canton-mvp/shared-types";
import type { TokenInstrumentId } from "./registry.js";

/** Intent to transfer tokens from one party to another. */
export interface TransferIntent {
  from: PartyId;
  to: PartyId;
  instrumentId: TokenInstrumentId;
  amount: string;
  /** Optional reference for idempotency / tracking. */
  referenceId?: string;
}

/** Approval state for a transfer (preapproval, consent, etc.). */
export interface TransferApproval {
  intent: TransferIntent;
  /** Approval status. */
  status: "pending" | "approved" | "rejected";
  /** Optional approval reference. */
  approvalId?: string;
}
