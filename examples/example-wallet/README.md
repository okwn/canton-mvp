# Example: Wallet-backed asset viewer

Minimal demo that connects a wallet and inspects holdings/balances via the Canton MVP API.

## What it proves

- **API as contract**: All logic lives in the API; this example is a thin client.
- **Reusable packages**: API uses `@canton-mvp/wallet-adapter` and `@canton-mvp/token-standard`; no duplication.
- **Wallet + tokens flow**: Session → connect → holdings → balances.

## Architecture

```
┌─────────────────────┐     ┌──────────────────────────────────────────┐
│  example-wallet     │     │  Canton MVP API                          │
│  (this script)     │────▶│  - /auth/login                            │
│                     │     │  - /wallet/connect  (wallet-adapter)      │
│  - fetch only       │     │  - /tokens/holdings (wallet + token-std)  │
│  - no packages      │     │  - /tokens/balances (token-standard)      │
└─────────────────────┘     └──────────────────────────────────────────┘
```

## Reusable vs demo-only

| Aspect | Reusable | Demo-only |
|--------|----------|-----------|
| API client pattern | ✅ fetch + Bearer | — |
| Auth flow | ✅ login → token | Mock login (no real IdP) |
| Wallet connect | ✅ POST /wallet/connect | MockWalletAdapter in API |
| Holdings/balances | ✅ GET /tokens/* | Mock data from adapter |

## Run

```bash
# Start API first
pnpm dev:api

# In another terminal
cd examples/example-wallet
pnpm start
```

Or with custom API URL:

```bash
API_URL=http://localhost:8080/api/v1 pnpm start
```

## Packages used (via API)

- `@canton-mvp/wallet-adapter` — session, connect, getHoldings
- `@canton-mvp/token-standard` — aggregateHoldingsToBalances
