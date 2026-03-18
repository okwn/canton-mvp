# Example: App onboarding

Full onboarding flow: create user → allocate party → connect wallet → inspect holdings. Uses the Canton MVP API only.

## What it proves

- **API as single entry point**: Auth, party-identity, wallet, tokens — all via API.
- **Reusable packages**: API uses party-identity, wallet-adapter, token-standard; no duplication.
- **Onboarding sequence**: User → Party → Wallet → Holdings.

## Architecture

```
┌─────────────────────────┐     ┌────────────────────────────────────────────┐
│  example-app-onboarding │     │  Canton MVP API                             │
│  (this script)          │────▶│  - /auth/login         (party-identity)     │
│                         │     │  - /parties/.../allocate                    │
│  - Sequential flow      │     │  - /parties/.../primary                     │
│  - No package deps      │     │  - /wallet/connect      (wallet-adapter)     │
│                         │     │  - /tokens/holdings     (token-standard)     │
│                         │     │  - /tokens/balances                         │
└─────────────────────────┘     └────────────────────────────────────────────┘
```

## Reusable vs demo-only

| Aspect | Reusable | Demo-only |
|--------|----------|-----------|
| User creation | ✅ login → userId | Mock auth |
| Party allocation | ✅ allocate + primary | Manual partyId |
| Wallet connect | ✅ POST /wallet/connect | MockWalletAdapter |
| Holdings/balances | ✅ GET /tokens/* | Mock data |

## Run

```bash
# Start API first
pnpm dev:api

# In another terminal
cd examples/example-app-onboarding
pnpm start
```

## Packages used (via API)

- `@canton-mvp/party-identity` — createUser, allocateParty, getPrimaryParty
- `@canton-mvp/wallet-adapter` — connect, session
- `@canton-mvp/token-standard` — holdings, aggregateHoldingsToBalances
