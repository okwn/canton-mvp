/**
 * Swap engine orchestrator.
 * Coordinates quote, deal, and settlement lifecycle.
 */

import type { PartyId } from "@canton-mvp/shared-types";
import type { TokenInstrumentId } from "@canton-mvp/token-standard";
import type { QuoteRequest, QuoteResponse, Deal, SettlementInstruction } from "./domain/models.js";
import { QuoteService } from "./services/QuoteService.js";
import { DealService } from "./services/DealService.js";
import type { ISwapEngineStore } from "./persistence/ISwapEngineStore.js";
import type { ISwapEngineEventEmitter } from "./events/SwapEngineEvents.js";

export interface SwapEngineConfig {
  store: ISwapEngineStore;
  events?: ISwapEngineEventEmitter;
}

export class SwapEngine {
  readonly quoteService: QuoteService;
  readonly dealService: DealService;
  private readonly store: ISwapEngineStore;
  private readonly events?: ISwapEngineEventEmitter;

  constructor(config: SwapEngineConfig) {
    this.store = config.store;
    if (config.events !== undefined) this.events = config.events;
    this.quoteService = new QuoteService(config.store, config.events);
    this.dealService = new DealService(config.store, config.events);
  }

  async requestQuote(
    requester: PartyId,
    counterparty: PartyId,
    giveInstrument: TokenInstrumentId,
    giveAmount: string,
    receiveInstrument: TokenInstrumentId,
    receiveAmount: string,
    validUntilMs?: number
  ): Promise<QuoteRequest> {
    return this.quoteService.createQuoteRequest(
      requester,
      counterparty,
      giveInstrument,
      giveAmount,
      receiveInstrument,
      receiveAmount,
      validUntilMs
    );
  }

  async respondToQuote(
    requestId: string,
    counterparty: PartyId,
    giveInstrument: TokenInstrumentId,
    giveAmount: string,
    receiveInstrument: TokenInstrumentId,
    receiveAmount: string,
    validUntilMs?: number
  ): Promise<QuoteResponse> {
    return this.quoteService.respondToQuote(
      requestId,
      counterparty,
      {
        party: counterparty,
        instrumentId: giveInstrument,
        amount: giveAmount,
        direction: "debit",
      },
      {
        party: counterparty,
        instrumentId: receiveInstrument,
        amount: receiveAmount,
        direction: "credit",
      },
      validUntilMs
    );
  }

  async acceptQuote(
    responseId: string,
    decidedBy: PartyId
  ): Promise<{ decision: Awaited<ReturnType<QuoteService["acceptQuote"]>>; deal: Deal }> {
    const response = await this.store.getQuoteResponse(responseId);
    if (!response) throw new Error("Quote response not found");

    const decision = await this.quoteService.acceptQuote(responseId, decidedBy);

    const request = await this.store.getQuoteRequest(response.requestId);
    if (!request) throw new Error("Quote request not found");

    const deal = await this.dealService.createDealFromAcceptance(
      response.requestId,
      responseId,
      decision.id,
      request.giveLeg,
      response.giveLeg,
      response.validUntil
    );
    this.events?.emit("quote_accepted", { decision, deal });
    return { decision, deal };
  }

  async rejectQuote(responseId: string, decidedBy: PartyId, reason?: string) {
    return this.quoteService.rejectQuote(responseId, decidedBy, reason);
  }

  async recordPreCheck(dealId: string, checkType: "balance" | "approval" | "compliance" | "custom", passed: boolean, details?: string) {
    return this.dealService.recordPreSettlementCheck(dealId, checkType, passed, details);
  }

  async recordApproval(dealId: string, legId: string, party: PartyId, status: "approved" | "rejected", approvalId?: string) {
    return this.dealService.recordLegApproval(dealId, legId, party, status, approvalId);
  }

  async createSettlementInstruction(dealId: string): Promise<SettlementInstruction> {
    return this.dealService.createSettlementInstruction(dealId);
  }

  async getDeal(dealId: string): Promise<Deal | null> {
    return this.store.getDeal(dealId);
  }

  async listDeals(limit?: number): Promise<Deal[]> {
    return this.store.listDeals(limit);
  }

  async listQuoteRequests(limit?: number): Promise<QuoteRequest[]> {
    return this.store.listQuoteRequests(limit);
  }

  async cancelDeal(dealId: string): Promise<Deal> {
    return this.dealService.cancelDeal(dealId);
  }

  async expireDeal(dealId: string): Promise<Deal> {
    return this.dealService.expireDeal(dealId);
  }

  async confirmSettlement(dealId: string): Promise<Deal> {
    return this.dealService.transition(dealId, "settlement_confirmed");
  }
}
