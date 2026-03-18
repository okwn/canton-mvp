# Swap Engine Extension Guide

> How to extend the swap engine for new workflows.

## Extension Points

### 1. Custom Pre-Settlement Checks

Add new check types beyond `balance`, `approval`, `compliance`, `custom`:

```ts
// Extend PreSettlementCheck.checkType in domain/models.ts
checkType: "balance" | "approval" | "compliance" | "custom" | "kyc" | "sanctions";

// Record custom checks
await engine.recordPreCheck(dealId, "kyc", true, "KYC verified");
```

### 2. Multi-Party Flows

The engine models bilateral exchange. For multi-party:

- **Option A:** Compose multiple bilateral deals (e.g. A–B and B–C).
- **Option B:** Extend `ExchangeLeg` to support more than two parties and add a new `Deal` shape. This requires changes to the state machine and settlement instruction builder.

### 3. DvP (Delivery vs Payment)

The same settlement model supports DvP: one leg is the “delivery” (asset), the other is the “payment”. Use `swapLegs` from token-standard to build the atomic settlement. No engine changes required.

### 4. Custom Persistence

Implement `ISwapEngineStore`:

```ts
import type { ISwapEngineStore } from "@canton-mvp/swap-engine";

export class PostgresSwapEngineStore implements ISwapEngineStore {
  async saveQuoteRequest(request: QuoteRequest): Promise<void> { /* ... */ }
  async getQuoteRequest(id: string): Promise<QuoteRequest | null> { /* ... */ }
  // ... implement all methods
}
```

### 5. Event-Driven Integration

Subscribe to events for downstream systems:

```ts
const events = new SwapEngineEventEmitter();
events.on("settlement_instruction_created", ({ instruction }) => {
  // Send to ledger submission service
  ledgerService.submit(instruction.settlement);
});
events.on("settlement_confirmed", ({ dealId }) => {
  // Update accounting, send notification
});
```

### 6. Validity and Expiry

Use `validUntil` on quotes and deals. Implement a background job to expire stale deals:

```ts
const expired = await store.getDealsByState("quote_responded");
for (const deal of expired) {
  if (deal.validUntil && Date.now() > deal.validUntil) {
    await engine.expireDeal(deal.id);
  }
}
```

### 7. Metadata and Compliance

Attach metadata to deals for compliance or audit:

```ts
// Extend Deal.metadata when creating
const deal = await engine.acceptQuote(responseId, decidedBy);
// Store KYC ref, trade ID, etc. in your persistence layer
```

### 8. Custom Settlement Shapes

For non-standard settlement (e.g. more than two legs), extend `createSettlementInstruction` in `DealService` to build a custom `Settlement` instead of using `swapLegs`. Ensure `isSettlementBalanced` still holds.

### 9. Compensating Actions

When extending, document compensating actions for new states or failure modes. See `packages/swap-engine/src/compensating/CompensatingActions.md`.

### 10. RFQ-Specific Logic

For RFQ workflows:

- Multiple responses per request: extend the store to allow multiple `QuoteResponse` per `QuoteRequest`, and add logic to select the best response.
- Response ranking: add a `score` or `price` field to `QuoteResponse` and implement selection logic in your application layer.

## Constraints

- **No partial settlement:** Never submit one leg without the other. Use atomic settlement.
- **Idempotency:** Settlement submission should be idempotent for safe retries.
- **Audit:** Emit events for all state transitions and compensating actions.

## Testing

Use `InMemorySwapEngineStore` for unit tests. Mock the event emitter to assert on emitted events.
