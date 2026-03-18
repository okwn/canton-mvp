# Architecture: example-app-onboarding

## Onboarding sequence

1. **Create user** — `POST /auth/login` → AppUser in party-identity store
2. **Allocate party** — `POST /parties/users/:userId/allocate` → CantonParty linked to user
3. **List / primary party** — `GET /parties/users/:userId`, `GET .../primary`
4. **Connect wallet** — `POST /wallet/connect` → session with partyId from wallet
5. **Inspect holdings** — `GET /tokens/holdings/:partyId` → from wallet provider
6. **Inspect balances** — `GET /tokens/balances/:partyId` → aggregated via token-standard

## Party vs wallet party

- **Allocated party**: Stored in party-identity; links user to a Canton party (e.g. from validator).
- **Wallet session party**: Returned by wallet adapter; may match allocated party when using real wallet.

In this demo, MockWalletAdapter returns a fixed default partyId. With a real wallet (DappSdkAdapter), the session party would typically match the user's allocated party after wallet linkage.

## Data flow

```
User (externalId) → AppUser (id)
                        ↓
CantonParty (partyId, userId, source)
                        ↓
WalletSession (partyId) ← wallet.connect()
                        ↓
Holdings ← walletProvider.getHoldings(partyId)
                        ↓
Balances ← aggregateHoldingsToBalances(holdings)
```

## Extending

- **Validator allocation**: Use `source: "validator"` and obtain partyId from Validator API.
- **Wallet linkage**: Call `POST /wallet/users/:userId/link` to store providerId + partyId mapping.
