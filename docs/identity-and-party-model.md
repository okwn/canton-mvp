# Identity and Party Model

> App users, Canton parties, and wallet linkage for onboarding flows.

## Overview

The identity model separates **app users** from **ledger parties** and supports both validator-based and external-party (wallet) flows. It is designed for future multi-wallet and institutional custody scenarios.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           App Layer                                     │
│  (auth, session, UI)                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    @canton-mvp/party-identity                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────────┐  │
│  │   Models    │  │   Service   │  │  Store (in-memory / DB)           │  │
│  │ AppUser     │  │ createUser  │  │  IPartyIdentityStore             │  │
│  │ CantonParty │  │ allocateParty│  │  InMemoryPartyIdentityStore      │  │
│  │ WalletId    │  │ attachMeta  │  │                                  │  │
│  │ UserRole    │  │ storeWallet │  │                                  │  │
│  │ ConnSession │  │ permissions │  │                                  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ Validator API   │    │ Wallet (dApp/Wallet │    │ Manual / Admin       │
│ (primaryParty)  │    │ SDK)                 │    │ allocation           │
└─────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## Models

### AppUser

Internal app identity. **Not** the ledger party.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | App user id |
| `email` | string? | Email |
| `externalId` | string? | Auth provider id (e.g. OIDC sub) |
| `role` | UserRole | user, admin, custodian |
| `createdAt` | number | Timestamp |
| `updatedAt` | number | Timestamp |

### CantonParty

Ledger party linked to an app user.

| Field | Type | Description |
|-------|------|-------------|
| `partyId` | PartyId | Canton party id |
| `userId` | string | App user id |
| `displayName` | string? | Display label |
| `source` | validator \| wallet \| manual | How party was obtained |
| `networkId` | string? | Network/synchronizer context |
| `metadata` | object? | Custom metadata |

### WalletIdentity

Links app user to external wallet / party.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Wallet identity id |
| `userId` | string | App user id |
| `providerId` | string | Wallet provider (dapp-sdk, wallet-sdk, mock) |
| `partyId` | PartyId | Party from wallet session |
| `walletAddress` | string? | Wallet-specific identifier |

### UserRole

| Role | Description |
|------|-------------|
| `user` | Standard user |
| `admin` | Admin permissions |
| `custodian` | Custodial / institutional |

### ConnectionSession

Active session (validator or wallet).

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Session id |
| `userId` | string | App user id |
| `partyId` | PartyId | Active party |
| `source` | validator \| wallet | Session source |
| `expiresAt` | number | Expiry timestamp |

## Service Methods

| Method | Description |
|--------|-------------|
| `createUser(input)` | Create app user |
| `allocateParty(input)` | Link party to user |
| `linkParty(userId, partyId, source)` | Alias for allocateParty |
| `attachMetadata(input)` | Add metadata to party |
| `storeWalletLinkage(input)` | Store wallet → party linkage |
| `getUser(userId)` | Get user |
| `getPartiesForUser(userId)` | List parties for user |
| `getPrimaryParty(userId)` | Get first linked party |
| `hasPermission(userId, permission)` | Check admin/custodian |
| `inspectPermissions(userId)` | Get full permission view |
| `resolvePartyId(userId)` | Resolve primary party id |

## API Endpoints

Base path: `/api/v1/identity`

| Method | Path | Description |
|--------|------|-------------|
| POST | /users | Create user |
| GET | /users/:userId | Get user |
| POST | /users/:userId/parties | Allocate/link party |
| GET | /users/:userId/parties | List parties |
| PATCH | /parties/:partyId/metadata | Attach metadata |
| POST | /users/:userId/wallets | Store wallet linkage |
| GET | /users/:userId/permissions | Inspect permissions |
| GET | /users/:userId/party | Resolve primary party |

## Onboarding Flows

### Validator-based flow

1. User authenticates via Validator (OIDC).
2. Validator returns `primaryParty` for the user.
3. App creates `AppUser` (from auth) and `allocateParty` with `source: "validator"`.

```
User → Validator Auth → primaryParty → createUser + allocateParty
```

### External-party (wallet) flow

1. User connects via wallet (dApp SDK / Wallet SDK).
2. Wallet returns `partyId` from session.
3. App creates `AppUser` (or looks up by external id), then `allocateParty` with `source: "wallet"` and `storeWalletLinkage`.

```
User → Wallet Connect → partyId → createUser + allocateParty + storeWalletLinkage
```

### Multi-wallet (future)

- One `AppUser` can have multiple `CantonParty` records (different sources).
- Multiple `WalletIdentity` records per user (different providers/parties).
- `getPartiesForUser` returns all linked parties.

### Institutional custody (future)

- `custodian` role for institutional actors.
- `hasPermission(userId, "custodian")` for custody checks.
- Separate party allocation for custodial vs. self-custody flows.

## Identity Boundaries

| Boundary | App Side | Ledger Side |
|----------|----------|-------------|
| **App user** | AppUser.id, email, role | — |
| **Ledger party** | CantonParty.partyId | Party on Canton |
| **Wallet** | WalletIdentity | External wallet session |

- Auth (OIDC, API keys) is **app-side**.
- Ledger identity (party) is **ledger-side**.
- The mapping (AppUser ↔ CantonParty) is stored in party-identity.

## Package Structure

```
packages/party-identity/src/
├── models/
│   ├── AppUser.ts
│   ├── CantonParty.ts
│   ├── WalletIdentity.ts
│   ├── ConnectionSession.ts
│   └── index.ts
├── store/
│   ├── IPartyIdentityStore.ts
│   └── InMemoryStore.ts
├── service/
│   └── PartyIdentityService.ts
└── index.ts
```

## Usage

```ts
import {
  InMemoryPartyIdentityStore,
  PartyIdentityService,
} from "@canton-mvp/party-identity";

const store = new InMemoryPartyIdentityStore();
const service = new PartyIdentityService(store);

const user = await service.createUser({ email: "alice@example.com", role: "user" });
const party = await service.allocateParty({
  userId: user.id,
  partyId: "party::1220...",
  source: "validator",
});
await service.storeWalletLinkage({
  userId: user.id,
  providerId: "dapp-sdk",
  partyId: party.partyId,
});
const perms = await service.inspectPermissions(user.id);
```
