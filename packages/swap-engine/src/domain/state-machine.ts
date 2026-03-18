/**
 * Deal state machine definitions.
 * Defines valid transitions and guards.
 */

import type { DealState } from "./models.js";

export type DealEvent =
  | "quote_received"
  | "accepted"
  | "rejected"
  | "pre_checks_passed"
  | "pre_checks_failed"
  | "approvals_complete"
  | "settlement_submitted"
  | "settlement_confirmed"
  | "cancel"
  | "expire";

/** Valid state transitions. */
export const STATE_TRANSITIONS: Record<DealState, DealEvent[]> = {
  quote_requested: ["quote_received", "cancel", "expire"],
  quote_responded: ["accepted", "rejected", "cancel", "expire"],
  accepted: ["pre_checks_passed", "pre_checks_failed", "cancel", "expire"],
  rejected: [],
  pre_settlement: ["pre_checks_passed", "pre_checks_failed", "cancel", "expire"],
  approvals_pending: ["approvals_complete", "cancel", "expire"],
  settlement_ready: ["settlement_submitted", "settlement_confirmed", "cancel", "expire"],
  settled: [],
  cancelled: [],
  expired: [],
};

/** Target state for each event from each source state. */
export const EVENT_TO_STATE: Partial<Record<DealEvent, DealState>> = {
  quote_received: "quote_responded",
  accepted: "accepted",
  rejected: "rejected",
  pre_checks_passed: "approvals_pending",
  pre_checks_failed: "cancelled",
  approvals_complete: "settlement_ready",
  settlement_submitted: "settlement_ready",
  settlement_confirmed: "settled",
  cancel: "cancelled",
  expire: "expired",
};

/** States that allow cancellation. */
export const CANCELLABLE_STATES: DealState[] = [
  "quote_requested",
  "quote_responded",
  "accepted",
  "pre_settlement",
  "approvals_pending",
  "settlement_ready",
];

/** States that are terminal. */
export const TERMINAL_STATES: DealState[] = ["rejected", "settled", "cancelled", "expired"];

export function canTransition(from: DealState, event: DealEvent): boolean {
  const allowed = STATE_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(event);
}

export function getTargetState(event: DealEvent): DealState | undefined {
  return EVENT_TO_STATE[event];
}
