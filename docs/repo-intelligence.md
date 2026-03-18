# Canton Network Ecosystem — Repository Intelligence

> **Purpose**: Curated intelligence for building a reusable Canton Network MVP starter kit. Use this as the source of truth when deciding what to borrow, adapt, or avoid from the Digital Asset ecosystem.

---

## 1. Ecosystem Categories

### Core Runtime / Protocol

| Repo | Role |
|------|------|
| **digital-asset/canton** | Canton blockchain protocol: synchronizers, participants, consensus, privacy-preserving state sync |
| **digital-asset/daml** | Daml smart contract language, SDK, Ledger API, transaction engine, development tooling |
| **digital-asset/decentralized-canton-sync** | Release distribution point for Splice (Global Synchronizer); main branch deprecated in favor of Splice |

### App Scaffolding

| Repo | Role |
|------|------|
| **digital-asset/cn-quickstart** | Full CN application scaffold: LocalNet, Spring Boot backend, TypeScript frontend, Daml contracts, OAuth2, observability |

### Wallet Integration

| Repo | Role |
|------|------|
| **digital-asset/wallet-gateway** | Docker build for Wallet Gateway (thin wrapper; implementation lives in splice-wallet-kernel) |
| **hyperledger-labs/splice-wallet-kernel** | **Primary wallet stack**: Wallet Gateway (remote + extension), dApp SDK (CIP-103), Wallet SDK, core modules (signing, store, ledger client, token standard) |

### Token Standards

| Repo | Role |
|------|------|
| **digital-asset/daml-finance** | Composable Daml libraries for tokenization: ownership, economic terms, instruments |
| **canton-foundation/cips** | Canton Improvement Proposals; CIP-0056 (token standard), CIP-103 (dApp API) |

### Infra / Security

| Repo | Role |
|------|------|
| **digital-asset/ex-secure-canton-infra** | Reference for mTLS, JWT, User/Party management, HA Sequencer/Mediator/Participant |
| **hyperledger-labs/splice** | Splice LocalNet compose, Amulet, governance, traffic acquisition, Name Service |

### Sample / Reference Integrations

| Repo | Role |
|------|------|
| **digital-asset/ex-java-json-api-bindings** | Java sample: JSON Ledger API, OpenAPI bindings, party setup, token transfers, IntegrationStore pattern |
| **digital-asset/xreserve-deposits** | USDC deposit flow: Ethereum → Circle xReserve → Canton attestation → mint USDCx |
| **digital-asset/daml-finance-app** | Demo app integrating daml-finance library |

### Developer Tooling

| Repo | Role |
|------|------|
| **digital-asset/dazl-client** | Python Ledger API client (Canton 2.x only; not Canton 3.x) |
| **@daml/ledger**, **@daml/types**, **@daml/react** | Official TypeScript/JavaScript bindings (via Daml SDK codegen) |

### Legacy / Examples / Non-Critical

| Repo | Role |
|------|------|
| **digital-asset/dazl-client** | Python-only; Canton 3.x apps should use JSON Ledger API + TypeScript |
| **digital-asset/ex-java-json-api-bindings** | Java; useful patterns but not the primary app stack for canton-mvp |
| **digital-asset/decentralized-canton-sync** | Historical; use Splice directly |

---

## 2. Per-Repo Intelligence

### digital-asset/cn-quickstart

| Field | Content |
|-------|---------|
| **Purpose** | Scaffolding for Canton Network apps targeting the Global Synchronizer. LocalNet-based (no DevNet). Spring Boot backend, TypeScript frontend, Daml contracts, OAuth2 (Keycloak), observability stack. |
| **Why it matters for canton-mvp** | Best reference for end-to-end CN app structure: topology, service layout, onboarding, tenant registration, licensing workflow. |
| **Borrow** | • Topology and port conventions (2xxx App User, 3xxx App Provider, 4xxx SV)<br>• Docker Compose modular layout and `splice-onboarding` usage<br>• `share_file` pattern for dynamic config (e.g. `APP_PROVIDER_PARTY`)<br>• Observability setup (Grafana, Prometheus, Loki, Tempo, OTEL)<br>• OAuth2 vs shared-secret auth modes<br>• Vite dev workflow for frontend |
| **Do NOT copy directly** | • Licensing workflow business logic (demo-specific)<br>• Java/Spring Boot backend (canton-mvp uses TypeScript app layer)<br>• Full Keycloak setup (optional; simplify for MVP)<br>• Enterprise-specific assumptions |

---

### digital-asset/canton

| Field | Content |
|-------|---------|
| **Purpose** | Canton protocol implementation: participants, synchronizers, domains, consensus, privacy. |
| **Why it matters for canton-mvp** | Foundation. canton-mvp runs on Canton; no direct code extraction. |
| **Borrow** | • Configuration patterns for participants and domains<br>• Port conventions (Ledger API, Admin API, JSON API) |
| **Do NOT copy directly** | • Protocol internals; treat as black-box runtime |

---

### digital-asset/daml

| Field | Content |
|-------|---------|
| **Purpose** | Daml language, SDK, Ledger API, sandbox, codegen, triggers. |
| **Why it matters for canton-mvp** | Contract layer source of truth. Daml defines models; codegen produces TypeScript types. |
| **Borrow** | • `daml codegen` for TypeScript bindings<br>• Daml project layout and `daml.yaml`<br>• Contract design patterns |
| **Do NOT copy directly** | • SDK internals; use as tooling only |

---

### digital-asset/decentralized-canton-sync

| Field | Content |
|-------|---------|
| **Purpose** | Release distribution for Splice (Global Synchronizer). Main branch deprecated; release-line branches hold Splice code dumps. |
| **Why it matters for canton-mvp** | Historical; Splice is the active project. |
| **Borrow** | • Release versioning and compatibility notes |
| **Do NOT copy directly** | • Code; use hyperledger-labs/splice instead |

---

### digital-asset/wallet-gateway

| Field | Content |
|-------|---------|
| **Purpose** | Docker build for the Wallet Gateway. Thin wrapper; implementation in splice-wallet-kernel. |
| **Why it matters for canton-mvp** | Deployment artifact for Wallet Gateway. |
| **Borrow** | • Docker/deployment patterns if using prebuilt gateway |
| **Do NOT copy directly** | • Implementation details; splice-wallet-kernel is the source |

---

### hyperledger-labs/splice-wallet-kernel

| Field | Content |
|-------|---------|
| **Purpose** | TypeScript framework for Canton wallet integrations: Wallet Gateway (remote + extension), dApp SDK (CIP-103), Wallet SDK, core modules (store, signing, ledger client, token standard). |
| **Why it matters for canton-mvp** | **Primary wallet reference**. Defines dApp ↔ Wallet Gateway ↔ Canton flow. |
| **Borrow** | • `@canton-network/dapp-sdk` usage (connect, prepare, execute)<br>• `core-ledger-client` patterns for Ledger API<br>• `core-token-standard` for CIP-0056<br>• Signing driver abstractions (participant, Fireblocks, Blockdaemon)<br>• Store interfaces (wallet-store, signing-store) |
| **Do NOT copy directly** | • Entire monorepo; extract patterns and depend on published packages where possible |

---

### digital-asset/dazl-client

| Field | Content |
|-------|---------|
| **Purpose** | Python Ledger API client for Canton 2.x. **Not for Canton 3.x.** |
| **Why it matters for canton-mvp** | Limited. canton-mvp targets TypeScript + JSON Ledger API. |
| **Borrow** | • Testing/automation patterns if using Python tooling |
| **Do NOT copy directly** | • As primary app client; use JSON Ledger API + TypeScript |

---

### digital-asset/ex-java-json-api-bindings

| Field | Content |
|-------|---------|
| **Purpose** | Java sample: OpenAPI-generated bindings, `daml codegen`, party setup, token transfers, transaction stream parsing, IntegrationStore for holdings. |
| **Why it matters for canton-mvp** | Strong reference for JSON Ledger API usage and token workflows. |
| **Borrow** | • JSON Ledger API endpoint patterns (version, users, rights, transfers)<br>• IntegrationStore / local state sync pattern for holdings<br>• Command completion polling<br>• External party setup and pre-approvals |
| **Do NOT copy directly** | • Java stack; reimplement patterns in TypeScript |

---

### digital-asset/ex-secure-canton-infra

| Field | Content |
|-------|---------|
| **Purpose** | Reference for mTLS, JWT, User/Party management, HA Sequencer/Mediator/Participant. |
| **Why it matters for canton-mvp** | Security and ops patterns for production. |
| **Borrow** | • PKI and certificate layout<br>• JWT/JWKS auth patterns<br>• HA topology |
| **Do NOT copy directly** | • Full setup; document as production reference, not MVP default |

---

### digital-asset/xreserve-deposits

| Field | Content |
|-------|---------|
| **Purpose** | USDC deposit: Ethereum → Circle xReserve → attestation → mint USDCx on Canton. |
| **Why it matters for canton-mvp** | Cross-chain deposit pattern for token workflows. |
| **Borrow** | • Deposit flow structure (script vs UI)<br>• Attestation retrieval pattern<br>• Config separation (e.g. `config_canton.ts`) |
| **Do NOT copy directly** | • USDC/xReserve specifics; treat as example for "deposit → attestation → mint" |

---

### digital-asset/daml-finance

| Field | Content |
|-------|---------|
| **Purpose** | Composable Daml libraries for tokenization: ownership, economic terms, instruments. |
| **Why it matters for canton-mvp** | Reusable token primitives; can align with CIP-0056. |
| **Borrow** | • DAR dependencies for token workflows<br>• Contract patterns for instruments and holdings |
| **Do NOT copy directly** | • Entire library; depend on published DARs and use as building blocks |

---

### digital-asset/daml-finance-app

| Field | Content |
|-------|---------|
| **Purpose** | Demo app showing daml-finance integration. |
| **Why it matters for canton-mvp** | Reference for daml-finance usage. |
| **Borrow** | • Integration patterns with daml-finance |
| **Do NOT copy directly** | • Demo UI and flows; extract patterns only |

---

### hyperledger-labs/splice

| Field | Content |
|-------|---------|
| **Purpose** | Reference apps for decentralized Canton sync: Amulet, Name Service, Wallet, Payment Scan, Governance, Traffic Acquisition. Splice LocalNet compose. |
| **Why it matters for canton-mvp** | LocalNet topology, Amulet/token patterns, governance. |
| **Borrow** | • LocalNet compose from `cluster/compose/localnet`<br>• Amulet/token patterns if building token apps<br>• Governance concepts |
| **Do NOT copy directly** | • Full Splice app suite; use as infra and pattern reference |

---

### hyperledger-labs/splice-wallet-kernel

| Field | Content |
|-------|---------|
| **Purpose** | See "Wallet Integration" above. Primary wallet stack for Canton. |
| **Why it matters for canton-mvp** | Core wallet abstraction for dApps. |
| **Borrow** | • dApp SDK usage, Wallet Gateway integration, token standard client |
| **Do NOT copy directly** | • Full kernel; depend on packages or extract minimal patterns |

---

## 3. Key Standards

| Standard | Purpose |
|----------|---------|
| **CIP-0056** | Canton token standard (ERC-20 analogue): holdings, transfers, pre-approvals, multi-step flows |
| **CIP-103** | dApp API: JSON-RPC 2.0 interface between dApps and wallet providers |
| **JSON Ledger API v2** | HTTP REST API for ledger operations; preferred over gRPC for web apps |

---

## 4. Dependency Graph (Conceptual)

```
canton-mvp
├── Canton (runtime)
├── Daml (contracts, codegen)
├── Splice LocalNet (dev topology)
├── splice-wallet-kernel packages (dApp SDK, ledger client, token standard)
├── daml-finance DARs (optional, for token workflows)
└── cn-quickstart patterns (topology, compose, observability)
```

---

*Last updated: March 2026. Optimized for a reusable Canton Network MVP starter kit.*
