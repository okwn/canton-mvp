# Architecture

Package map, structure, and dependency graph for Canton MVP.

## Overview

```mermaid
flowchart LR
    subgraph Apps
        Web[web]
        API[api]
        Admin[admin]
    end

    subgraph Core["Core Packages"]
        SwapEngine[swap-engine]
        PartyIdentity[party-identity]
        TokenStandard[token-standard]
        WalletAdapter[wallet-adapter]
    end

    subgraph Canton["Canton Clients"]
        CantonClient[canton-client]
        ValidatorClient[validator-client]
        ScanClient[scan-client]
    end

    subgraph Shared["Shared"]
        SharedTypes[shared-types]
        Observability[observability]
        TestUtils[test-utils]
    end

    API --> SwapEngine
    API --> PartyIdentity
    API --> TokenStandard
    API --> WalletAdapter
    API --> CantonClient
    API --> ValidatorClient
    API --> Observability
    Web --> API
    CantonClient --> SharedTypes
    ValidatorClient --> CantonClient
    ScanClient --> CantonClient
    SwapEngine --> TokenStandard
    SwapEngine --> SharedTypes
```

## Apps

| App | Port | Purpose |
|-----|------|---------|
| **web** | 3000 | Reference frontend: onboarding, wallet, tokens, swaps, ops |
| **api** | 8080 | Backend: auth, parties, wallet, tokens, swaps, admin |
| **admin** | 3001 | Admin dashboard (optional) |
| **docs-site** | — | Documentation site (VitePress) |

## Packages

### Canton clients

| Package | Purpose |
|---------|---------|
| **canton-client** | JSON Ledger API v2: submit-and-wait, commands, events |
| **validator-client** | Validator API: user, DSO party, metadata |
| **scan-client** | Scan API: scans, transfer registry |

### Domain

| Package | Purpose |
|---------|---------|
| **swap-engine** | Quote/deal orchestration, state machine, settlement instruction |
| **token-standard** | CIP-0056: holdings, settlement, swap legs |
| **wallet-adapter** | CIP-103: connect, session, signing, holdings |
| **party-identity** | User, party, permissions, wallet linkage |

### Shared

| Package | Purpose |
|---------|---------|
| **shared-types** | PartyId, CantonConfig, DTOs |
| **observability** | Logging, correlation IDs, OTEL/metrics stubs |
| **test-utils** | Mocks (Validator, Scan, Ledger), Daml fixtures |
| **daml-models** | Daml source, generated types |
| **eslint-config** | Shared ESLint config |

## Examples & Integrations

| Path | Purpose |
|------|---------|
| **examples/example-wallet** | Wallet session + holdings/balances |
| **examples/example-swap-flow** | RFQ → respond → accept → deal |
| **examples/example-app-onboarding** | User → party → wallet → holdings |
| **integrations/api-client** | Minimal API client for Node/browser |

Examples use only the API; no direct package imports.

## Data Flow (Swap)

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant SwapEngine
    participant TokenStandard
    participant Wallet

    Client->>API: POST /swaps/quotes
    API->>SwapEngine: requestQuote
    SwapEngine-->>API: QuoteRequest
    API-->>Client: 201

    Client->>API: POST /swaps/quotes/respond
    API->>SwapEngine: respondToQuote
    SwapEngine-->>API: QuoteResponse
    API-->>Client: 201

    Client->>API: POST /swaps/quotes/accept
    API->>SwapEngine: acceptQuote
    SwapEngine->>SwapEngine: createDeal
    SwapEngine-->>API: Deal
    API-->>Client: 200

    Note over API,Wallet: Settlement: createSettlementInstruction, wallet signing, ledger submit
```

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| **Client → API** | Bearer/JWT auth |
| **API → Canton** | TLS, optional mTLS |
| **Wallet** | Signing boundary; keys never leave wallet |

See [docs/deployment-trust-boundaries.md](docs/deployment-trust-boundaries.md).
