# Example: RFQ to settlement flow

End-to-end swap demo: request quote → respond → accept → inspect deal. Uses the Canton MVP API only.

## What it proves

- **Swap engine via API**: All quote/deal logic in `@canton-mvp/swap-engine`; this example is a thin client.
- **No duplication**: No swap logic in this example; only API calls.
- **Full flow**: RFQ → response → acceptance → deal inspection.

## Architecture

```
┌─────────────────────┐     ┌──────────────────────────────────────────┐
│  example-swap-flow   │     │  Canton MVP API                         │
│  (this script)      │────▶│  - /auth/login                           │
│                     │     │  - POST /swaps/quotes      (request)      │
│  - Two users        │     │  - POST /swaps/quotes/respond             │
│  - Sequential flow  │     │  - POST /swaps/quotes/accept              │
│                     │     │  - GET  /swaps/deals/:id                 │
└─────────────────────┘     │  (swap-engine)                           │
                            └──────────────────────────────────────────┘
```

## Reusable vs demo-only

| Aspect | Reusable | Demo-only |
|--------|----------|-----------|
| Quote request | ✅ API contract | Party IDs are mock |
| Respond / accept | ✅ API contract | — |
| Deal inspection | ✅ API contract | — |
| Settlement | — | Not implemented (ledger submission) |

## Run

```bash
# Start API first
pnpm dev:api

# In another terminal
cd examples/example-swap-flow
pnpm start
```

## Packages used (via API)

- `@canton-mvp/swap-engine` — requestQuote, respondToQuote, acceptQuote, getDeal
