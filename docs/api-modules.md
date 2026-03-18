# API Modules

> Module-by-module endpoint reference.

## Auth (`/api/v1/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /login | No | Create/find user, return userId (mock) |
| GET | /me | No | Get current user from Bearer (mock) |

**Login body:** `{ email?: string, externalId?: string }`

---

## Users (`/api/v1/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | / | Yes | Create app user |
| GET | /:userId | Yes | Get user |
| GET | /:userId/permissions | Yes | Inspect permissions |

**Create user body:** `{ email?: string, externalId?: string, role?: "user" | "admin" | "custodian" }`

---

## Parties (`/api/v1/parties`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /users/:userId/allocate | Yes | Allocate/link party to user |
| GET | /users/:userId | Yes | List parties for user |
| GET | /users/:userId/primary | Yes | Get primary party |
| PATCH | /:partyId/metadata | Yes | Attach metadata to party |

**Allocate body:** `{ partyId: string, source: "validator" | "wallet" | "manual", displayName?: string, networkId?: string }`

---

## Wallet (`/api/v1/wallet`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /users/:userId/link | Yes | Store wallet linkage |
| GET | /session | Yes | Get current wallet session |
| POST | /connect | Yes | Connect wallet (mock) |
| POST | /disconnect | Yes | Disconnect wallet |

**Link body:** `{ providerId: string, partyId: string, walletAddress?: string }`

---

## Tokens (`/api/v1/tokens`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /holdings/:partyId | Yes | Get holdings for party |
| GET | /balances/:partyId | Yes | Get aggregated balances |

---

## Swaps (`/api/v1/swaps`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /quotes | Yes | Request quote (RFQ) |
| POST | /quotes/respond | Yes | Respond to quote |
| POST | /quotes/accept | Yes | Accept quote, create deal |
| POST | /quotes/reject | Yes | Reject quote |
| GET | /deals/:dealId | Yes | Get deal |
| POST | /deals/:dealId/cancel | Yes | Cancel deal |

**Quote request body:** `{ requester, counterparty, giveInstrument, giveAmount, receiveInstrument, receiveAmount, validUntilMs? }`

**Quote response body:** `{ requestId, counterparty, giveInstrument, giveAmount, receiveInstrument, receiveAmount, validUntilMs? }`

---

## Network (`/api/v1/network`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /metadata | Optional | Get validator + DSO metadata |
| GET | /config | Optional | Get Canton config URLs |

---

## Admin (`/api/v1/admin`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health/detailed | Yes (admin) | Detailed health check |
| GET | /users/:userId/parties | Yes (admin) | List parties for user |

Admin routes require `role: "admin"` on the authenticated user.
