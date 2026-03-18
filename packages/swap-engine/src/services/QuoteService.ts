/**
 * Quote lifecycle domain service.
 */

import type { PartyId } from "@canton-mvp/shared-types";
import type { TokenInstrumentId } from "@canton-mvp/token-standard";
import type { QuoteRequest, QuoteResponse, QuoteDecision, ExchangeLeg } from "../domain/models.js";
import type { ISwapEngineStore } from "../persistence/ISwapEngineStore.js";
import type { ISwapEngineEventEmitter } from "../events/SwapEngineEvents.js";

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export class QuoteService {
  constructor(
    private readonly store: ISwapEngineStore,
    private readonly events?: ISwapEngineEventEmitter
  ) {}

  async createQuoteRequest(
    requester: PartyId,
    counterparty: PartyId,
    giveInstrument: TokenInstrumentId,
    giveAmount: string,
    receiveInstrument: TokenInstrumentId,
    receiveAmount: string,
    validUntilMs?: number
  ): Promise<QuoteRequest> {
    const now = Date.now();
    const request: QuoteRequest = {
      id: generateId("qr"),
      requester,
      counterparty,
      giveLeg: {
        party: requester,
        instrumentId: giveInstrument,
        amount: giveAmount,
        direction: "debit",
      },
      receiveLeg: {
        party: requester,
        instrumentId: receiveInstrument,
        amount: receiveAmount,
        direction: "credit",
      },
      ...(validUntilMs !== undefined && { validUntil: now + validUntilMs }),
      createdAt: now,
    };
    await this.store.saveQuoteRequest(request);
    this.events?.emit("quote_requested", { request });
    return request;
  }

  async respondToQuote(
    requestId: string,
    counterparty: PartyId,
    giveLeg: ExchangeLeg,
    receiveLeg: ExchangeLeg,
    validUntilMs?: number
  ): Promise<QuoteResponse> {
    const request = await this.store.getQuoteRequest(requestId);
    if (!request) throw new Error(`Quote request not found: ${requestId}`);
    if (request.counterparty !== counterparty) throw new Error("Counterparty mismatch");

    const now = Date.now();
    const response: QuoteResponse = {
      id: generateId("qresp"),
      requestId,
      counterparty,
      giveLeg,
      receiveLeg,
      ...(validUntilMs !== undefined && { validUntil: now + validUntilMs }),
      createdAt: now,
    };
    await this.store.saveQuoteResponse(response);
    this.events?.emit("quote_responded", { response });
    return response;
  }

  async acceptQuote(responseId: string, decidedBy: PartyId): Promise<QuoteDecision> {
    const response = await this.store.getQuoteResponse(responseId);
    if (!response) throw new Error(`Quote response not found: ${responseId}`);

    const now = Date.now();
    const decision: QuoteDecision = {
      id: generateId("qd"),
      responseId,
      decidedBy,
      outcome: "accepted",
      createdAt: now,
    };
    await this.store.saveQuoteDecision(decision);
    return decision;
  }

  async rejectQuote(responseId: string, decidedBy: PartyId, reason?: string): Promise<QuoteDecision> {
    const response = await this.store.getQuoteResponse(responseId);
    if (!response) throw new Error(`Quote response not found: ${responseId}`);

    const now = Date.now();
    const decision: QuoteDecision = {
      id: generateId("qd"),
      responseId,
      decidedBy,
      outcome: "rejected",
      ...(reason !== undefined && { reason }),
      createdAt: now,
    };
    await this.store.saveQuoteDecision(decision);
    this.events?.emit("quote_rejected", { decision });
    return decision;
  }
}
