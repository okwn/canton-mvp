# Swap Engine Overview

> Reusable orchestration layer for bilateral exchange workflows on Canton.

## Purpose

The swap engine provides a **reference pattern** for building exchange workflows without hardcoding a single business product. It models the full lifecycle from quote request through settlement and supports:

- OTC (over-the-counter) trades
- Request-for-quote (RFQ) flows
- Simple bilateral settlement
- Asset exchange (e.g. token-for-token)

The engine is **enterprise-appropriate** and Canton-aligned. It does not use DeFi jargon.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Application Layer                                │
│  (RFQ UI, OTC desk, settlement service)                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      @canton-mvp/swap-engine                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ SwapEngine  │  │ QuoteService│  │ DealService │  │ Event Emitter   │  │
│  │ (orchestr.) │  │             │  │             │  │                 │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ State Machine │ Persistence (ISwapEngineStore) │ Compensating Notes  ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  @canton-mvp/token-standard (Settlement, swapLegs)                        │
│  Canton Ledger (Daml contracts, CIP-0056)                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## Lifecycle

1. **Quote request** – Requester asks counterparty for a quote (give X, receive Y).
2. **Quote response** – Counterparty responds with confirmed or adjusted terms.
3. **Acceptance / rejection** – Requester accepts or rejects.
4. **Pre-settlement checks** – Balance, approval, compliance checks.
5. **Transfer approvals** – Per-leg approvals (e.g. preapprovals).
6. **Settlement instruction** – Build atomic settlement for ledger submission.
7. **Finalization** – Submit to ledger, confirm settlement.
8. **Cancellation / expiry** – Terminate at any cancellable stage.

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Quote request** | Requester specifies what they give and what they want to receive. |
| **Quote response** | Counterparty confirms or adjusts the terms. |
| **Deal** | Orchestration unit created when a quote is accepted. |
| **Exchange leg** | One side of the exchange (party, instrument, amount, direction). |
| **Settlement instruction** | Ready-to-submit settlement (token-standard `Settlement`). |

## Domain Models

- `QuoteRequest` – id, requester, counterparty, giveLeg, receiveLeg, validUntil
- `QuoteResponse` – id, requestId, counterparty, giveLeg, receiveLeg, validUntil
- `QuoteDecision` – responseId, decidedBy, outcome (accepted/rejected)
- `Deal` – id, state, legs, validUntil, metadata
- `PreSettlementCheck` – dealId, checkType, passed, details
- `LegApproval` – dealId, legId, party, status
- `SettlementInstruction` – dealId, settlement, checksPassed, approvalsComplete

## Services

| Service | Responsibility |
|---------|----------------|
| **QuoteService** | Create quote request, respond, accept/reject. |
| **DealService** | Create deal from acceptance, transition state, record checks/approvals, create settlement instruction, cancel/expire. |
| **SwapEngine** | Orchestrator; exposes high-level API. |

## Persistence

Implement `ISwapEngineStore` for your storage (in-memory, SQL, event store). The engine does not assume a specific backend.

## Events

Subscribe to lifecycle events for audit, UI, or integration:

- `quote_requested`, `quote_responded`, `quote_accepted`, `quote_rejected`
- `deal_state_changed`, `pre_settlement_check`, `leg_approval`
- `settlement_instruction_created`, `settlement_confirmed`
- `deal_cancelled`, `deal_expired`

## Compensating Actions

See `packages/swap-engine/src/compensating/CompensatingActions.md` for strategy notes when deals fail or are cancelled at each stage.

## Usage

```ts
import {
  SwapEngine,
  InMemorySwapEngineStore,
  SwapEngineEventEmitter,
} from "@canton-mvp/swap-engine";

const store = new InMemorySwapEngineStore();
const events = new SwapEngineEventEmitter();
const engine = new SwapEngine({ store, events });

const request = await engine.requestQuote(
  requesterParty,
  counterpartyParty,
  giveInstrument,
  giveAmount,
  receiveInstrument,
  receiveAmount,
  60_000
);

const response = await engine.respondToQuote(
  request.id,
  counterpartyParty,
  giveInstrument,
  giveAmount,
  receiveInstrument,
  receiveAmount
);

const { deal } = await engine.acceptQuote(response.id, requesterParty);
await engine.recordPreCheck(deal.id, "balance", true);
await engine.dealService.transition(deal.id, "pre_checks_passed");
await engine.recordApproval(deal.id, "leg-1", partyA, "approved");
await engine.recordApproval(deal.id, "leg-2", partyB, "approved");
await engine.dealService.transition(deal.id, "approvals_complete");
const instruction = await engine.createSettlementInstruction(deal.id);
// Submit instruction.settlement to ledger, then:
await engine.confirmSettlement(deal.id);
```

## See Also

- [swap-state-machine.md](./swap-state-machine.md) – State machine details
- [swap-extension-guide.md](./swap-extension-guide.md) – Extending for new workflows
