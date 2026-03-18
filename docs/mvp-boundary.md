# Canton MVP — Scope and Boundary

> **Purpose**: Define what canton-mvp includes in v1, what is out of scope, and what belongs to examples vs core packages. Optimized for a reusable builder starter, not a one-off demo.

---

## 1. What canton-mvp Includes in v1

### Core Packages (in scope)

| Package | Description |
|---------|-------------|
| **Daml contract layer** | Minimal Daml models: a starter template (e.g. simple asset or token) that demonstrates contract creation, choices, and party relationships. No licensing or complex business logic. |
| **TypeScript app layer** | Thin backend/frontend scaffold: JSON Ledger API v2 client, auth/party mapping utilities, and a minimal UI shell. |
| **Wallet abstraction** | Integration points for CIP-103 dApp API: connect, prepare, execute. Abstraction over Wallet Gateway / dApp SDK so apps can swap providers. |
| **Token abstraction (CIP-0056)** | Wrapper around CIP-0056 token operations: query holdings, transfer, pre-approvals. Reusable across swaps, wallets, onboarding. |
| **LocalNet dev environment** | Docker Compose setup based on Splice LocalNet: single participant (or minimal multi-party) for local development. |
| **Auth and party mapping** | Utilities for mapping authenticated users to Daml parties (e.g. JWT → party ID). Shared-secret mode for dev; OAuth2-ready hooks. |
| **Observability baseline** | Optional Prometheus + Grafana (or equivalent) for metrics. Structured logging. No full OTEL stack in v1. |
| **Monorepo structure** | Clear separation: `packages/` (core), `examples/` (reference apps), `daml/` (contracts). |

### Deliverables

- `make setup` / `make build` / `make start` for one-command dev
- Documented patterns for: swap flow, wallet-enabled dApp, onboarding, token workflow
- README with prerequisites (Daml SDK, Node, Docker) and quick start

---

## 2. What Is Explicitly Out of Scope (v1)

| Area | Reason |
|------|--------|
| **Production HA** | No multi-node HA, no Kubernetes. LocalNet only. |
| **Full OAuth2/Keycloak** | Auth hooks exist; full IdP setup is example/optional. |
| **Java/Spring Boot backend** | TypeScript-first app layer. |
| **gRPC Ledger API** | JSON Ledger API v2 only for web-friendly integration. |
| **Python dazl** | Not for Canton 3.x; TypeScript + JSON API only. |
| **Cross-chain (e.g. xReserve)** | Deposit/attestation flows are examples, not core. |
| **Splice Amulet / governance** | Use Splice infra; Amulet-specific logic is example. |
| **Enterprise licensing workflow** | Demo-specific; not part of core. |
| **Browser extension wallet** | Wallet Gateway remote only; extension is future. |

---

## 3. Examples vs Core Packages

### Core Packages (`packages/`)

Reusable, minimal, no business-specific logic:

- `@canton-mvp/ledger-client` — JSON Ledger API v2 wrapper
- `@canton-mvp/wallet-abstraction` — CIP-103 / dApp API abstraction
- `@canton-mvp/token-standard` — CIP-0056 operations wrapper
- `@canton-mvp/auth` — Party mapping, JWT parsing
- `@canton-mvp/config` — Env, topology, validator URLs

### Examples (`examples/`)

Reference implementations that use core packages:

- `examples/simple-swap` — Two-party token swap using token abstraction
- `examples/wallet-dapp` — Wallet-enabled dApp: connect, view holdings, transfer
- `examples/onboarding` — User onboarding and party allocation
- `examples/token-workflow` — Mint, transfer, query holdings
- `examples/xreserve-deposit` — (Optional) Cross-chain deposit pattern, adapted from xreserve-deposits

### Daml (`daml/`)

- `daml/starter` — Core starter template (minimal asset/token)
- `daml/token-workflows` — (Optional) Contracts for token examples, or dependency on daml-finance DARs

---

## 4. Extraction Over Copying

| Source | Extract | Do Not Copy |
|-------|--------|-------------|
| cn-quickstart | Topology, compose layout, `share_file` pattern, observability layout | Licensing workflow, Spring Boot, full Keycloak |
| ex-java-json-api-bindings | IntegrationStore pattern, JSON API flows, completion polling | Java, Maven, Amulet-specific logic |
| splice-wallet-kernel | dApp SDK usage, token standard client patterns | Full kernel, Fireblocks/Blockdaemon drivers |
| xreserve-deposits | Deposit → attestation → mint flow structure | USDC, Circle, Ethereum specifics |
| daml-finance-app | daml-finance integration pattern | Demo UI and flows |

---

## 5. Version and Compatibility

- **Canton**: Target Canton 3.x (JSON Ledger API v2)
- **Daml**: 2.x or 3.x as per Daml SDK
- **Splice LocalNet**: Use version compatible with target Canton
- **splice-wallet-kernel**: Use published `@canton-network/*` packages where available

---

## 6. Success Criteria for v1

1. Developer can clone, run `make setup && make start`, and see a minimal app talking to LocalNet.
2. Core packages are importable and documented for swaps, wallet dApps, onboarding, token workflows.
3. Examples demonstrate each pattern without embedding business logic in core.
4. Documentation explains what to borrow from the ecosystem and what to avoid.

---

*Last updated: March 2026.*
