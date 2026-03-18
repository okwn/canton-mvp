# Swap State Machine

> Deal lifecycle states and valid transitions.

## States

| State | Description |
|-------|-------------|
| `quote_requested` | Quote request sent; awaiting response. |
| `quote_responded` | Counterparty responded; awaiting acceptance/rejection. |
| `accepted` | Quote accepted; deal created; pre-settlement checks in progress. |
| `rejected` | Quote rejected. Terminal. |
| `pre_settlement` | Pre-settlement checks in progress (alternative to `accepted`). |
| `approvals_pending` | Pre-checks passed; awaiting leg approvals. |
| `settlement_ready` | Approvals complete; settlement instruction created; ready for ledger submission. |
| `settled` | Settlement confirmed on ledger. Terminal. |
| `cancelled` | Deal cancelled. Terminal. |
| `expired` | Quote or deal expired. Terminal. |

## Events

| Event | Description |
|-------|-------------|
| `quote_received` | Counterparty responded to quote. |
| `accepted` | Requester accepted the quote. |
| `rejected` | Requester rejected the quote. |
| `pre_checks_passed` | All pre-settlement checks passed. |
| `pre_checks_failed` | One or more pre-settlement checks failed. |
| `approvals_complete` | All leg approvals obtained. |
| `settlement_submitted` | Settlement submitted to ledger. |
| `settlement_confirmed` | Ledger confirmed settlement. |
| `cancel` | Deal cancelled. |
| `expire` | Deal expired. |

## Transition Diagram

```
                    quote_received
quote_requested ──────────────────────► quote_responded
       │                                       │
       │ cancel/expire                    accepted
       │                                       │
       ▼                                       ▼
   cancelled/expired                        accepted
       (terminal)                                │
                                            pre_checks_passed
                                                 │
                                                 ▼
                                          approvals_pending
                                                 │
                                                 │ cancel/expire
                                                 │
                                            approvals_complete
                                                 │
                                                 ▼
                                          settlement_ready
                                                 │
                                                 │ cancel/expire
                                                 │
                                          settlement_confirmed
                                                 │
                                                 ▼
                                            settled
                                          (terminal)
```

## Valid Transitions

| From | Allowed events |
|------|----------------|
| `quote_requested` | `quote_received`, `cancel`, `expire` |
| `quote_responded` | `accepted`, `rejected`, `cancel`, `expire` |
| `accepted` | `pre_checks_passed`, `pre_checks_failed`, `cancel`, `expire` |
| `rejected` | (none) |
| `pre_settlement` | `pre_checks_passed`, `pre_checks_failed`, `cancel`, `expire` |
| `approvals_pending` | `approvals_complete`, `cancel`, `expire` |
| `settlement_ready` | `settlement_submitted`, `settlement_confirmed`, `cancel`, `expire` |
| `settled` | (none) |
| `cancelled` | (none) |
| `expired` | (none) |

## Cancellable States

Deals can be cancelled in: `quote_requested`, `quote_responded`, `accepted`, `pre_settlement`, `approvals_pending`, `settlement_ready`.

## Terminal States

No further transitions: `rejected`, `settled`, `cancelled`, `expired`.

## Usage

```ts
import { canTransition, getTargetState, type DealEvent } from "@canton-mvp/swap-engine";

if (canTransition(deal.state, "pre_checks_passed")) {
  const target = getTargetState("pre_checks_passed"); // "approvals_pending"
  await dealService.transition(deal.id, "pre_checks_passed");
}
```
