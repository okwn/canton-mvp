# Frontend Architecture

> Reference frontend for Canton app builders.

## Overview

The `apps/web` frontend is a Next.js App Router application that demonstrates onboarding, wallet connection, balances, quote/swap workflows, and network diagnostics. It prioritizes clarity and extensibility over visual drama.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Data fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| Styling | CSS variables, minimal custom CSS |

## Structure

```
apps/web/src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout, providers
│   ├── page.tsx            # Home
│   ├── connect/            # Onboarding / sign in
│   ├── dashboard/          # User + party overview
│   ├── wallet/             # Session state
│   ├── tokens/             # Balances & holdings
│   ├── swaps/              # Swap list
│   │   └── new/            # Quote request form
│   ├── admin/network/      # Network diagnostics
│   └── dev/contracts/      # Developer panel
├── components/
│   ├── ui/                 # Shell, LoadingState, ErrorState, EmptyState
│   ├── forms/              # LoginForm, QuoteRequestForm
│   ├── transaction/        # TransactionReview
│   └── timeline/           # EventTimeline
├── hooks/                  # useAuth, useUsers, useParties, useWallet, useTokens, useSwaps, useNetwork
├── lib/                    # api client
├── providers/              # QueryProvider, AuthProvider
└── types/
```

## Pages

| Path | Purpose |
|------|---------|
| `/` | Home, navigation links |
| `/connect` | Sign in (mock), redirects to dashboard when authenticated |
| `/dashboard` | User info, primary party |
| `/wallet` | Wallet session, connect/disconnect |
| `/tokens` | Balances and holdings for linked party |
| `/swaps` | Swap overview, link to new quote |
| `/swaps/new` | Quote request form |
| `/admin/network` | Network metadata, config |
| `/dev/contracts` | Developer mode panel |

## API Integration

- **Base URL**: `NEXT_PUBLIC_API_URL` (default: `http://localhost:8080/api/v1`)
- **Auth**: Bearer token (userId in dev; replace with JWT in production)
- **Client**: `lib/api.ts` – `apiGet`, `apiPost`, `apiPatch`

## State Model

- **Auth**: `AuthProvider` – userId, token, persisted in localStorage
- **Server state**: TanStack Query – users, parties, wallet, tokens, swaps, network
- **Form state**: React Hook Form – login, quote request

## Loading / Error / Empty States

All data-dependent views use:

- `LoadingState` – loading indicator
- `ErrorState` – error message + retry
- `EmptyState` – no data, optional action (e.g. link to connect)

## Extensibility

- **New pages**: Add under `app/`, use existing hooks
- **New API calls**: Add hook in `hooks/`, use `apiGet`/`apiPost`
- **New forms**: Use React Hook Form + Zod, follow `QuoteRequestForm` pattern
- **Transaction review**: Use `TransactionReview` component
- **Event timeline**: Use `EventTimeline` with `TimelineEvent[]`
