# Examples Index

Example implementations that prove Canton MVP is reusable. Each example uses **only** the API; no duplication of core logic.

## Quick reference

| Example | Purpose | API surface |
|---------|---------|--------------|
| [example-wallet](../examples/example-wallet/) | Wallet-backed asset viewer | auth, wallet, tokens |
| [example-swap-flow](../examples/example-swap-flow/) | RFQ to settlement demo | auth, swaps |
| [example-app-onboarding](../examples/example-app-onboarding/) | Create user, link party, connect wallet, inspect holdings | auth, parties, wallet, tokens |

## Run all examples

```bash
# 1. Start the API
pnpm dev:api

# 2. Run an example (in another terminal)
cd examples/example-wallet && pnpm start
cd examples/example-swap-flow && pnpm start
cd examples/example-app-onboarding && pnpm start
```

## Architecture principle

```
┌─────────────────────────────────────────────────────────────────┐
│  Examples (thin clients)                                         │
│  - fetch only                                                    │
│  - no @canton-mvp/* package imports (except integration client)   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Canton MVP API                                                  │
│  - swap-engine, party-identity, token-standard, wallet-adapter   │
│  - Single source of truth                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Reusable packages (used by API)

| Package | Used in | Example |
|---------|---------|---------|
| `@canton-mvp/swap-engine` | Swaps API | example-swap-flow |
| `@canton-mvp/party-identity` | Auth, Parties API | example-app-onboarding |
| `@canton-mvp/token-standard` | Tokens API | example-wallet, example-app-onboarding |
| `@canton-mvp/wallet-adapter` | Wallet, Tokens API | example-wallet, example-app-onboarding |

## Demo-only vs reusable

| Aspect | Demo-only | Reusable |
|--------|-----------|----------|
| Mock auth (userId as token) | ✅ | Use JWT in production |
| MockWalletAdapter | ✅ | Use DappSdkAdapter / WalletSdkAdapter |
| Mock party IDs | ✅ | Allocate from Validator |
| API contract (paths, payloads) | — | ✅ |
| Package encapsulation | — | ✅ |

## Integrations

See [integrations/](../integrations/) for reusable integration components:

- **api-client** — Minimal fetch-based API client for Node/browser
