/**
 * Event emission hooks for swap engine.
 * Subscribe to lifecycle events for audit, UI, or integration.
 */

import type {
  QuoteRequest,
  QuoteResponse,
  QuoteDecision,
  Deal,
  PreSettlementCheck,
  LegApproval,
  SettlementInstruction,
} from "../domain/models.js";
import type { DealEvent } from "../domain/state-machine.js";

export type SwapEngineEventType =
  | "quote_requested"
  | "quote_responded"
  | "quote_accepted"
  | "quote_rejected"
  | "deal_state_changed"
  | "pre_settlement_check"
  | "leg_approval"
  | "settlement_instruction_created"
  | "settlement_confirmed"
  | "deal_cancelled"
  | "deal_expired";

export interface SwapEngineEventMap {
  quote_requested: { request: QuoteRequest };
  quote_responded: { response: QuoteResponse };
  quote_accepted: { decision: QuoteDecision; deal: Deal };
  quote_rejected: { decision: QuoteDecision };
  deal_state_changed: { deal: Deal; event: DealEvent };
  pre_settlement_check: { check: PreSettlementCheck };
  leg_approval: { approval: LegApproval };
  settlement_instruction_created: { instruction: SettlementInstruction };
  settlement_confirmed: { dealId: string };
  deal_cancelled: { deal: Deal };
  deal_expired: { deal: Deal };
}

export type SwapEngineEventHandler<K extends SwapEngineEventType> = (
  payload: SwapEngineEventMap[K]
) => void;

export interface ISwapEngineEventEmitter {
  on<K extends SwapEngineEventType>(event: K, handler: SwapEngineEventHandler<K>): () => void;
  off<K extends SwapEngineEventType>(event: K, handler: SwapEngineEventHandler<K>): void;
  emit<K extends SwapEngineEventType>(event: K, payload: SwapEngineEventMap[K]): void;
}

export class SwapEngineEventEmitter implements ISwapEngineEventEmitter {
  private readonly listeners = new Map<SwapEngineEventType, Set<(p: unknown) => void>>();

  on<K extends SwapEngineEventType>(event: K, handler: SwapEngineEventHandler<K>): () => void {
    const set = this.listeners.get(event) ?? new Set();
    set.add(handler as (p: unknown) => void);
    this.listeners.set(event, set);
    return () => this.off(event, handler);
  }

  off<K extends SwapEngineEventType>(event: K, handler: SwapEngineEventHandler<K>): void {
    this.listeners.get(event)?.delete(handler as (p: unknown) => void);
  }

  emit<K extends SwapEngineEventType>(event: K, payload: SwapEngineEventMap[K]): void {
    this.listeners.get(event)?.forEach((h) => h(payload));
  }
}
