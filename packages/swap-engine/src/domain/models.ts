/**
 * Swap engine domain models.
 * Reusable for OTC, RFQ, bilateral settlement, asset exchange.
 */

import type { PartyId } from "@canton-mvp/shared-types";
import type { TokenInstrumentId } from "@canton-mvp/token-standard";
import type { Settlement } from "@canton-mvp/token-standard";

/** Leg of a bilateral exchange (one side gives, other receives). */
export interface ExchangeLeg {
  party: PartyId;
  instrumentId: TokenInstrumentId;
  amount: string;
  /** Debit = party gives; credit = party receives. */
  direction: "debit" | "credit";
}

/** Quote request (RFQ-style). */
export interface QuoteRequest {
  id: string;
  requester: PartyId;
  counterparty: PartyId;
  /** What requester gives. */
  giveLeg: ExchangeLeg;
  /** What requester receives. */
  receiveLeg: ExchangeLeg;
  /** Optional validity window (ms). */
  validUntil?: number;
  createdAt: number;
}

/** Quote response (counterparty's offer). */
export interface QuoteResponse {
  id: string;
  requestId: string;
  counterparty: PartyId;
  /** Confirmed or adjusted legs. */
  giveLeg: ExchangeLeg;
  receiveLeg: ExchangeLeg;
  /** Optional validity window (ms). */
  validUntil?: number;
  createdAt: number;
}

/** Acceptance or rejection of a quote. */
export interface QuoteDecision {
  id: string;
  responseId: string;
  /** Who decided (requester or counterparty). */
  decidedBy: PartyId;
  outcome: "accepted" | "rejected";
  reason?: string;
  createdAt: number;
}

/** Pre-settlement check result. */
export interface PreSettlementCheck {
  id: string;
  dealId: string;
  checkType: "balance" | "approval" | "compliance" | "custom";
  passed: boolean;
  details?: string;
  createdAt: number;
}

/** Transfer approval for a leg. */
export interface LegApproval {
  dealId: string;
  legId: string;
  party: PartyId;
  status: "pending" | "approved" | "rejected";
  approvalId?: string;
  createdAt: number;
}

/** Settlement instruction (ready for ledger submission). */
export interface SettlementInstruction {
  id: string;
  dealId: string;
  settlement: Settlement;
  /** All pre-checks passed. */
  checksPassed: boolean;
  /** All leg approvals obtained. */
  approvalsComplete: boolean;
  createdAt: number;
}

/** Deal lifecycle state. */
export type DealState =
  | "quote_requested"
  | "quote_responded"
  | "accepted"
  | "rejected"
  | "pre_settlement"
  | "approvals_pending"
  | "settlement_ready"
  | "settled"
  | "cancelled"
  | "expired";

/** Deal (orchestration unit). */
export interface Deal {
  id: string;
  state: DealState;
  requestId: string;
  responseId?: string;
  decisionId?: string;
  settlementInstructionId?: string;
  /** Requester gives (debit). */
  giveLeg: ExchangeLeg;
  /** Counterparty gives (debit). */
  receiveLeg: ExchangeLeg;
  validUntil?: number;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}
