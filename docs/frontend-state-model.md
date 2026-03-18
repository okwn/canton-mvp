# Frontend State Model

> How state flows through the Canton MVP frontend.

## Auth State

| Source | Storage | Scope |
|-------|--------|-------|
| `AuthProvider` | React context + localStorage | userId, token |
| `useAuth()` | — | `{ userId, token, setAuth, clearAuth }` |

**Flow:**
1. User submits `LoginForm` → `useLogin` mutation → API `POST /auth/login`
2. On success, `setAuth(userId)` → context + localStorage
3. On load, `AuthProvider` reads localStorage, restores userId/token
4. Sign out → `clearAuth()` → clear context + localStorage

## Server State (TanStack Query)

| Query key | Hook | API | When enabled |
|-----------|------|-----|--------------|
| `["user", userId]` | `useUser` | GET /users/:userId | userId && token |
| `["parties", userId]` | `useParties` | GET /parties/users/:userId | userId && token |
| `["primaryParty", userId]` | `usePrimaryParty` | GET /parties/users/:userId/primary | userId && token |
| `["wallet", "session"]` | `useWalletSession` | GET /wallet/session | token |
| `["holdings", partyId]` | `useHoldings` | GET /tokens/holdings/:partyId | partyId && token |
| `["balances", partyId]` | `useBalances` | GET /tokens/balances/:partyId | partyId && token |
| `["deal", dealId]` | `useDeal` | GET /swaps/deals/:dealId | dealId && token |
| `["network", "metadata"]` | `useNetworkMetadata` | GET /network/metadata | always |
| `["network", "config"]` | `useNetworkConfig` | GET /network/config | always |

**Mutations** invalidate related queries on success (e.g. `useAllocateParty` → invalidate `["parties", userId]`).

## Form State

| Form | Library | Validation |
|------|---------|------------|
| Login | React Hook Form | Zod |
| Quote request | React Hook Form | Zod |

Form state is local to the component. On submit, mutations are called; TanStack Query handles server state updates.

## UI State

- **Loading**: `isLoading` from queries/mutations
- **Error**: `isError`, `error` from queries/mutations
- **Empty**: `data` is null/empty, or specific conditions (e.g. no party linked)

No global UI state store; each page composes hooks and renders accordingly.

## Data Flow Diagram

```
User action (e.g. Login)
    → Form submit
    → Mutation (useLogin)
    → API call
    → onSuccess: setAuth()
    → AuthProvider updates
    → Queries with enabled: !!token refetch
    → UI re-renders with new data
```

## Persistence

| Data | Where | Lifetime |
|------|-------|----------|
| userId | localStorage | Until sign out |
| Server data | TanStack Query cache | Until unmount / stale (30s default) |

No persistence of holdings, deals, etc. on the client; always fetched from API.
