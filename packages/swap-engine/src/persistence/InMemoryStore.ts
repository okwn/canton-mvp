/**
 * In-memory swap engine store.
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
import type { ISwapEngineStore } from "./ISwapEngineStore.js";

export class InMemorySwapEngineStore implements ISwapEngineStore {
  private quoteRequests = new Map<string, QuoteRequest>();
  private quoteResponses = new Map<string, QuoteResponse>();
  private quoteResponsesByRequest = new Map<string, string>();
  private quoteDecisions = new Map<string, QuoteDecision>();
  private deals = new Map<string, Deal>();
  private preSettlementChecks = new Map<string, PreSettlementCheck[]>();
  private legApprovals = new Map<string, LegApproval[]>();
  private settlementInstructions = new Map<string, SettlementInstruction>();

  async saveQuoteRequest(request: QuoteRequest): Promise<void> {
    this.quoteRequests.set(request.id, { ...request });
  }

  async getQuoteRequest(id: string): Promise<QuoteRequest | null> {
    const r = this.quoteRequests.get(id);
    return r ? { ...r } : null;
  }

  async saveQuoteResponse(response: QuoteResponse): Promise<void> {
    this.quoteResponses.set(response.id, { ...response });
    this.quoteResponsesByRequest.set(response.requestId, response.id);
  }

  async getQuoteResponse(id: string): Promise<QuoteResponse | null> {
    const r = this.quoteResponses.get(id);
    return r ? { ...r } : null;
  }

  async getQuoteResponseByRequestId(requestId: string): Promise<QuoteResponse | null> {
    const id = this.quoteResponsesByRequest.get(requestId);
    return id ? this.getQuoteResponse(id) : null;
  }

  async saveQuoteDecision(decision: QuoteDecision): Promise<void> {
    this.quoteDecisions.set(decision.responseId, { ...decision });
  }

  async getQuoteDecision(responseId: string): Promise<QuoteDecision | null> {
    const d = this.quoteDecisions.get(responseId);
    return d ? { ...d } : null;
  }

  async saveDeal(deal: Deal): Promise<void> {
    this.deals.set(deal.id, { ...deal });
  }

  async getDeal(id: string): Promise<Deal | null> {
    const d = this.deals.get(id);
    return d ? { ...d } : null;
  }

  async updateDeal(deal: Deal): Promise<void> {
    this.deals.set(deal.id, { ...deal });
  }

  async savePreSettlementCheck(check: PreSettlementCheck): Promise<void> {
    const list = this.preSettlementChecks.get(check.dealId) ?? [];
    list.push({ ...check });
    this.preSettlementChecks.set(check.dealId, list);
  }

  async getPreSettlementChecks(dealId: string): Promise<PreSettlementCheck[]> {
    const list = this.preSettlementChecks.get(dealId) ?? [];
    return list.map((c) => ({ ...c }));
  }

  async saveLegApproval(approval: LegApproval): Promise<void> {
    const list = this.legApprovals.get(approval.dealId) ?? [];
    const idx = list.findIndex((a) => a.legId === approval.legId && a.party === approval.party);
    if (idx >= 0) list[idx] = { ...approval };
    else list.push({ ...approval });
    this.legApprovals.set(approval.dealId, list);
  }

  async getLegApprovals(dealId: string): Promise<LegApproval[]> {
    const list = this.legApprovals.get(dealId) ?? [];
    return list.map((a) => ({ ...a }));
  }

  async saveSettlementInstruction(instruction: SettlementInstruction): Promise<void> {
    this.settlementInstructions.set(instruction.id, { ...instruction });
  }

  async getSettlementInstruction(id: string): Promise<SettlementInstruction | null> {
    const i = this.settlementInstructions.get(id);
    return i ? { ...i } : null;
  }

  async listDeals(limit = 100): Promise<Deal[]> {
    const all = Array.from(this.deals.values())
      .map((d) => ({ ...d }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    return all.slice(0, limit);
  }

  async listQuoteRequests(limit = 100): Promise<QuoteRequest[]> {
    const all = Array.from(this.quoteRequests.values())
      .map((r) => ({ ...r }))
      .sort((a, b) => b.createdAt - a.createdAt);
    return all.slice(0, limit);
  }
}
