# Architecture Decision Records (ADRs)

> **Purpose**: ADR-style decisions for the Canton Network MVP starter kit. Each decision is opinionated and optimized for a reusable builder starter.

---

## ADR-001: Monorepo

### Status
Accepted

### Context
Canton apps involve Daml contracts, TypeScript/Node app layer, and optional infra config. We need a structure that supports shared packages, examples, and clear boundaries.

### Decision
Use a **monorepo** with:

- `packages/` — Core reusable packages (ledger-client, wallet-abstraction, token-standard, auth, config)
- `examples/` — Reference apps (swap, wallet-dapp, onboarding, token-workflow)
- `daml/` — Daml contracts and DARs
- `docker/` or `infra/` — Compose, LocalNet config

Use a workspace manager (e.g. pnpm workspaces, Yarn workspaces) for TypeScript packages. Daml lives in `daml/` with its own build.

### Consequences
- Single clone, consistent tooling, shared types
- Examples can depend on core packages without publishing
- Clear separation between reusable code and demos

---

## ADR-002: TypeScript App Layer

### Status
Accepted

### Context
cn-quickstart uses Java/Spring Boot. Many web and dApp developers prefer TypeScript/Node. Canton JSON Ledger API is HTTP/REST and fits well with Node.

### Decision
Use **TypeScript/Node** as the primary app layer:

- Backend: Node + Express (or Fastify) for API and Ledger integration
- Frontend: React or Vue with Vite
- Shared: TypeScript types from `daml codegen`

No Java/Spring Boot in core. Java samples (e.g. ex-java-json-api-bindings) are used for pattern extraction only.

### Consequences
- Single language across app stack
- Daml codegen produces TypeScript; no extra bindings layer
- Aligns with splice-wallet-kernel (TypeScript) and web-native dApps

---

## ADR-003: Daml Contract Layer

### Status
Accepted

### Context
Daml is the smart contract language for Canton. Contracts define the authoritative business logic.

### Decision
- **Minimal starter template** in core: one or two contracts (e.g. simple asset, token) to demonstrate creation, choices, and parties
- **No business-specific logic** in core contracts (e.g. no licensing workflow)
- **Optional dependency** on daml-finance DARs for token workflows; document how to add them
- Use `daml build` and `daml codegen` in CI; DARs published to a known path for app layer

### Consequences
- Developers see a working contract → app flow quickly
- Core stays generic; examples show richer token/swap logic
- daml-finance can be added without changing core structure

---

## ADR-004: JSON Ledger API v2 First

### Status
Accepted

### Context
Canton exposes gRPC Ledger API and HTTP JSON Ledger API. Web apps and serverless often prefer HTTP. JSON API v2 is the modern, REST-style interface.

### Decision
Use **JSON Ledger API v2** as the primary ledger interface:

- All ledger operations (create, exercise, query, stream) via HTTP JSON
- No gRPC in the app layer
- Use OpenAPI-generated client or hand-written fetch wrapper; ensure compatibility with Canton 3.x JSON API

### Consequences
- Simpler integration for web and serverless
- No gRPC tooling or proto management
- Aligns with ex-java-json-api-bindings and splice-wallet-kernel patterns

---

## ADR-005: Wallet Abstraction Layer

### Status
Accepted

### Context
dApps need to connect to wallets, prepare transactions, and execute. CIP-103 defines the dApp API. splice-wallet-kernel provides dApp SDK and Wallet Gateway.

### Decision
Introduce a **wallet abstraction layer**:

- Abstract over CIP-103 / dApp API: connect, prepare, execute
- Support Wallet Gateway (remote) as primary; document extension path
- Do not embed Wallet Gateway implementation; depend on `@canton-network/dapp-sdk` or equivalent
- Core package exposes a thin interface so apps can swap providers (e.g. different gateway URLs, future extension)

### Consequences
- Apps depend on an abstraction, not a specific gateway implementation
- Easier testing (mock provider) and future multi-provider support
- Aligns with "WalletConnect for Canton" model

---

## ADR-006: CIP-0056 Token Abstraction

### Status
Accepted

### Context
CIP-0056 is Canton’s token standard. Token workflows (swaps, wallets, onboarding) need holdings, transfers, pre-approvals.

### Decision
Provide a **CIP-0056 token abstraction**:

- Wrapper over token standard operations: query holdings, transfer, pre-approvals
- Use Splice token standard client (`core-token-standard`) or equivalent where available
- Document UTXO management (e.g. merge delegation, ~10 UTXOs per user) for production
- Core package is generic; examples show swap, wallet, onboarding flows

### Consequences
- Consistent token handling across examples
- Developers get a reusable API instead of raw contract calls
- Aligns with ecosystem (CantonSwap, Obsidian, Splice)

---

## ADR-007: Auth and Party Mapping

### Status
Accepted

### Context
Canton uses parties. Apps need to map authenticated users (JWT, OAuth) to party IDs. cn-quickstart uses Keycloak + tenant registration.

### Decision
- **Core**: Utilities for party mapping (e.g. JWT `sub` or custom claim → party ID)
- **Dev default**: Shared-secret mode (simple token, no IdP)
- **Production path**: OAuth2-ready; document Keycloak or similar integration; do not bundle full IdP in core
- **Tenant registration**: Document pattern (e.g. admin endpoint to register tenant + party); example only, not core implementation

### Consequences
- MVP runs without OAuth2; production can add it
- Clear separation: auth utilities in core, IdP setup in examples/docs
- Aligns with cn-quickstart’s optional OAuth2

---

## ADR-008: Observability

### Status
Accepted

### Context
Production Canton apps need metrics, logs, traces. cn-quickstart includes Grafana, Prometheus, Loki, Tempo, OTEL.

### Decision
- **v1 baseline**: Optional Prometheus + Grafana for metrics; structured JSON logging
- **No full OTEL stack** in core; document how to add it
- **Log format**: Consistent structure (e.g. request ID, party, operation) for debugging
- **Metrics**: Key operations (ledger calls, transfer count, errors) as counters/histograms

### Consequences
- Minimal observability for MVP; enough for local debugging
- Production teams can extend with full OTEL/Loki/Tempo
- Avoids heavy default dependency set

---

## Summary Table

| ADR | Decision |
|-----|----------|
| 001 | Monorepo: packages/, examples/, daml/ |
| 002 | TypeScript app layer (Node + React/Vue) |
| 003 | Minimal Daml starter; optional daml-finance |
| 004 | JSON Ledger API v2 only |
| 005 | Wallet abstraction over CIP-103 |
| 006 | CIP-0056 token abstraction |
| 007 | Party mapping utilities; shared-secret dev, OAuth2-ready |
| 008 | Optional Prometheus + Grafana; structured logging |

---

*Last updated: March 2026.*
