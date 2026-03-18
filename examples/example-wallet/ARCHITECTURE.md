# Architecture: example-wallet

## Data flow

1. **Login** → `POST /auth/login` → returns `userId` (used as Bearer token in dev)
2. **Connect** → `POST /wallet/connect` → API calls `walletProvider.connect()` (MockWalletAdapter)
3. **Holdings** → `GET /tokens/holdings/:partyId` → API calls `walletProvider.getHoldings(partyId)`
4. **Balances** → `GET /tokens/balances/:partyId` → API uses `aggregateHoldingsToBalances()` from token-standard

## Why no direct package imports?

This example intentionally uses **only** the API. That proves:

- Any client (web, mobile, script) can build on the same API.
- The API encapsulates wallet-adapter and token-standard; clients don't need to know.
- Swapping MockWalletAdapter for DappSdkAdapter requires no client changes.

## Extending to a real wallet

Replace `MockWalletAdapter` in the API context with `DappSdkAdapter` or `WalletSdkAdapter`. The example script stays the same; only the API and its wallet gateway configuration change.
