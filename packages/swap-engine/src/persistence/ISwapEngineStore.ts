/**
 * Persistence interface for swap engine.
 * Implement with in-memory, SQL, or event store.
 */

import type {
  QuoteRequest,
  QuoteResponse,
  QuoteDecision,
  PreSettlementCheck,
  LegApproval,
  SettlementInstruction,
  Deal,
} from "../domain/models.js";

export interface ISwapEngineStore {
  // Quote lifecycle
  saveQuoteRequest(request: QuoteRequest): Promise<void>;
  getQuoteRequest(id: string): Promise<QuoteRequest | null>;

  saveQuoteResponse(response: QuoteResponse): Promise<void>;
  getQuoteResponse(id: string): Promise<QuoteResponse | null>;
  getQuoteResponseByRequestId(requestId: string): Promise<QuoteResponse | null>;

  saveQuoteDecision(decision: QuoteDecision): Promise<void>;
  getQuoteDecision(responseId: string): Promise<QuoteDecision | null>;

  // Deal lifecycle
  saveDeal(deal: Deal): Promise<void>;
  getDeal(id: string): Promise<Deal | null>;
  updateDeal(deal: Deal): Promise<void>;

  // Pre-settlement
  savePreSettlementCheck(check: PreSettlementCheck): Promise<void>;
  getPreSettlementChecks(dealId: string): Promise<PreSettlementCheck[]>;

  // Approvals
  saveLegApproval(approval: LegApproval): Promise<void>;
  getLegApprovals(dealId: string): Promise<LegApproval[]>;

  // Settlement
  saveSettlementInstruction(instruction: SettlementInstruction): Promise<void>;
  getSettlementInstruction(id: string): Promise<SettlementInstruction | null>;

  // Ops / admin
  listDeals(limit?: number): Promise<Deal[]>;
  listQuoteRequests(limit?: number): Promise<QuoteRequest[]>;
}
