# Architecture: example-swap-flow

## State machine (swap-engine)

```
quote_requested → quote_responded → accepted → [pre_settlement → approvals_pending → settlement_ready → settled]
                    ↓
                rejected / expired
```

This example stops at `accepted`. Settlement (ledger submission) is out of scope.

## API → swap-engine mapping

| API endpoint | SwapEngine method |
|--------------|-------------------|
| POST /swaps/quotes | requestQuote |
| POST /swaps/quotes/respond | respondToQuote |
| POST /swaps/quotes/accept | acceptQuote |
| POST /swaps/quotes/reject | rejectQuote |
| GET /swaps/deals/:id | getDeal |
| POST /swaps/deals/:id/cancel | cancelDeal |

## Two-party flow

1. **Requester** (user A): Creates quote request with give/receive legs.
2. **Counterparty** (user B): Responds with confirmed legs.
3. **Requester**: Accepts or rejects. Accept creates a Deal.
4. **Either**: Can inspect deal, cancel (if allowed), or proceed to settlement.

## Extending to settlement

To complete settlement, the API would need to:
- Call `createSettlementInstruction(dealId)`
- Use wallet/ledger to submit signed transactions
- Transition deal to `settled`

That requires ledger connectivity and is not shown in this demo.
