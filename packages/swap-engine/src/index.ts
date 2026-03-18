/**
 * @canton-mvp/swap-engine
 *
 * Reusable orchestration layer for bilateral exchange workflows.
 * OTC, RFQ, simple bilateral settlement, asset exchange.
 */

// Domain
export type {
  QuoteRequest,
  QuoteResponse,
  QuoteDecision,
  ExchangeLeg,
  PreSettlementCheck,
  LegApproval,
  SettlementInstruction,
  Deal,
  DealState,
} from "./domain/models.js";
export {
  STATE_TRANSITIONS,
  CANCELLABLE_STATES,
  TERMINAL_STATES,
  canTransition,
  getTargetState,
} from "./domain/state-machine.js";
export type { DealEvent } from "./domain/state-machine.js";

// Persistence
export type { ISwapEngineStore } from "./persistence/ISwapEngineStore.js";
export { InMemorySwapEngineStore } from "./persistence/InMemoryStore.js";

// Events
export {
  SwapEngineEventEmitter,
  type ISwapEngineEventEmitter,
  type SwapEngineEventType,
  type SwapEngineEventMap,
} from "./events/SwapEngineEvents.js";

// Services
export { QuoteService } from "./services/QuoteService.js";
export { DealService } from "./services/DealService.js";

// Orchestrator
export { SwapEngine, type SwapEngineConfig } from "./SwapEngine.js";
