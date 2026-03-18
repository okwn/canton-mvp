# canton-mvp General Implementation Report

---

## Purpose

### What canton-mvp Is

Canton MVP is a TypeScript monorepo starter kit for building applications on the Canton Network. It provides a Fastify API, a Next.js reference frontend, reusable packages for Canton integration (Ledger, Validator, Scan), and abstractions for wallet, tokens, and swap orchestration. The repository is designed to be forked and extended by teams building Canton-powered applications.

### Why It Exists

Canton Network applications require integration across multiple layers: Daml contracts, JSON Ledger API, Validator/Scan APIs, wallet connectivity, token operations, and business logic. Canton MVP exists to provide a coherent, documented base layer so teams can start from a working architecture rather than assembling components from scratch.

### Who It Is For

- **Teams building on Canton** — OTC desks, settlement services, token platforms, internal prototypes
- **Developers forking a base** — Those who need clear package boundaries, extension points, and production-oriented patterns
- **Builders who want TypeScript** — End-to-end TypeScript with strict config and shared types

### What Problem It Solves for Canton Builders

Canton builders face fragmentation: Daml contracts, multiple API surfaces (Ledger, Validator, Scan), wallet standards (CIP-103), token standards (CIP-0056), and the need for orchestration logic. Canton MVP solves this by providing a single, coherent stack with documented boundaries, mock implementations for local development, and a reference frontend that demonstrates the full flow.

---

## Executive Summary

### What Has Been Implemented

The repository contains a functional API with auth, party allocation, wallet session, token holdings/balances, and swap (RFQ) orchestration. A Next.js web app provides onboarding, wallet connect, balances, swap flows, and admin/ops views. Reusable packages include canton-client (JSON Ledger API v2), validator-client, scan-client, wallet-adapter (with MockWalletAdapter), token-standard, swap-engine, and party-identity. Daml contracts model QuoteRequest, SwapIntent, SettlementInstruction, and related primitives. Observability (logging, correlation IDs, metrics stubs), security hardening (JWT strategy, rate limiting, secure logging), operational views (health, errors, commands, swap states, party audit), and examples (wallet, swap flow, onboarding) are implemented. Testing includes unit tests for packages, integration tests for API flows, and an E2E happy-path scenario. CI runs build, lint, and test.

### Overall Architectural Direction

The architecture is API-centric: the Fastify server is the single entry point. Clients (web, examples) call the API only; no direct package imports in client code. Packages are encapsulated behind the API. Canton clients (Ledger, Validator, Scan) are used when configured; mock wallet and in-memory stores allow development without a running Canton environment.

### Current Maturity Level

**Early-stage starter kit with substantial implementation.** Core flows work end-to-end. Mock components (wallet, stores) are production placeholders. Ledger submission is not wired; persistence is in-memory. Security and ops tooling are documented and partially implemented (JWT path exists, rate limiting optional, ops dashboard functional).

### Usability as a Starter Kit

**Partially usable.** A developer can fork the repo, run `pnpm install && pnpm build && pnpm dev:api && pnpm dev:web`, and build a wallet-enabled app, token viewer, or RFQ-style swap flow using the existing API and frontend patterns. For production deployment, significant work remains: real wallet adapter, persistent stores, ledger submission, JWT issuance, and Canton environment setup.

---

## Repository-Wide Implementation Audit

### apps/

| App | Purpose | Implemented | Status |
|-----|---------|------------|--------|
| **api** | Backend API server | Fastify app with auth, users, parties, wallet, tokens, swaps, network, admin, admin-ops. Correlation middleware, error handler, rate limiting (optional), Swagger. | **Complete** for MVP scope |
| **web** | Reference frontend | Next.js 15 App Router, pages: /, /connect, /dashboard, /wallet, /tokens, /swaps, /swaps/new, /swaps/[dealId], /admin/network, /admin/ops, /dev/contracts. TanStack Query, Zod forms, Shell, LoadingState, ErrorState, EmptyState, TransactionReview, EventTimeline. | **Complete** |
| **admin** | Admin dashboard | Separate Vite app. | **Partial** — may overlap with web admin/ops |
| **docs-site** | Documentation site | VitePress. | **Partial** — structure exists |

### packages/

| Package | Purpose | Implemented | Status |
|---------|---------|------------|--------|
| **canton-client** | JSON Ledger API v2 client | fetchWithRetry, submitAndWait, commands, errors, types. | **Complete** |
| **validator-client** | Validator API client | getValidatorUser, getDsoPartyId, getValidatorPartyMetadata. | **Complete** |
| **scan-client** | Scan API client | getScans, getNetworkMetadata, getTransferRegistryInfo. | **Complete** |
| **wallet-adapter** | CIP-103 wallet abstraction | IWalletProvider, MockWalletAdapter, WalletEventEmitter. DappSdkAdapter/WalletSdkAdapter stubs. | **Complete** (mock); real adapters **Scaffold** |
| **token-standard** | CIP-0056 token operations | Schemas, mappers, settlement (swapLegs, aggregateHoldingsToBalances). | **Complete** |
| **swap-engine** | Swap orchestration | QuoteService, DealService, state machine, InMemoryStore, events. | **Complete** |
| **party-identity** | User, party, permissions | PartyIdentityService, InMemoryStore, allocateParty, inspectPermissions. | **Complete** |
| **observability** | Logging, correlation, metrics | createLogger, createStructuredLogger, correlation IDs, redaction, OTEL/metrics stubs. | **Complete** |
| **shared-types** | Shared TypeScript types | PartyId, CantonConfig, DTOs. | **Complete** |
| **test-utils** | Test utilities | MOCK_CANTON_CONFIG, createMockPartyId, MockValidatorClient, MockScanClient, createMockLedgerFetch, Daml fixtures. | **Complete** |
| **daml-models** | Daml contracts | Types, QuoteRequest, SwapIntent, SettlementInstruction, TokenIntent, TransferApproval, AppConnection, PartyProfile, AppRegistry, AuditEvent. | **Complete** for MVP scope |
| **eslint-config** | Shared ESLint config | Base, node, react configs. | **Complete** |

### infra/

| Item | Purpose | Implemented | Status |
|------|---------|------------|--------|
| **docker-compose.observability.yml** | Prometheus + Grafana | Services defined, volumes. | **Complete** |
| **prometheus/prometheus.yml** | Scrape config | Job for canton-mvp-api /metrics. | **Complete** — API must expose /metrics |
| **grafana/provisioning/datasources/** | Prometheus datasource | Configured. | **Complete** |
| **README** | Infra docs | Brief usage. | **Complete** |

### integrations/

| Item | Purpose | Implemented | Status |
|------|---------|------------|--------|
| **api-client** | Minimal API client | createApiClient, get/post/patch, withToken. | **Complete** |
| **quickstart-overlay** | cn-quickstart integration | Bootstrap, validate scripts, port-map, compatibility docs. | **Partial** — scripts and docs; integration depends on external cn-quickstart |

### examples/

| Example | Purpose | Implemented | Status |
|---------|---------|------------|--------|
| **example-wallet** | Wallet session + holdings/balances | run.ts, README, ARCHITECTURE. | **Complete** |
| **example-swap-flow** | RFQ → respond → accept → deal | run.ts, README, ARCHITECTURE. | **Complete** |
| **example-app-onboarding** | User → party → wallet → holdings | run.ts, README, ARCHITECTURE. | **Complete** |

### docs/

| Category | Files | Status |
|----------|-------|--------|
| **Architecture** | repository-map, architecture-decisions, mvp-boundary, api-design, api-modules | **Complete** |
| **Daml** | daml-domain-model, daml-choice-flow | **Complete** |
| **Canton** | json-ledger-api-v2, network-adapters, client-error-model | **Complete** |
| **Wallet** | wallet-layer, wallet-flow-sequence | **Complete** |
| **Token** | token-standard-abstraction | **Complete** |
| **Swap** | swap-engine-overview, swap-state-machine, swap-extension-guide | **Complete** |
| **Identity** | identity-and-party-model | **Complete** |
| **Frontend** | frontend-architecture, frontend-state-model | **Complete** |
| **Security** | security-boundaries, security-model, key-management-boundaries, deployment-trust-boundaries, production-hardening-checklist | **Complete** |
| **Ops** | observability, runbooks, local-ops | **Complete** |
| **Testing** | testing-strategy, mocking-guide, e2e-scenarios | **Complete** |
| **Examples** | examples-index | **Complete** |
| **Other** | dev-setup, quickstart-overlay, repo-intelligence, first-release-checklist | **Complete** |

### Root Config / Tooling

| File | Purpose | Status |
|------|---------|--------|
| **package.json** | Root scripts, turbo, devDependencies | **Complete** |
| **pnpm-workspace.yaml** | Workspace: apps, packages, examples, integrations | **Complete** |
| **turbo.json** | Build, dev, lint, test, clean tasks | **Complete** |
| **tsconfig.base.json** | Strict TypeScript base | **Complete** |
| **Makefile** | install, setup, build, dev, lint, test, docker, overlay | **Complete** |
| **.github/workflows/ci.yml** | Build, lint, test on push/PR | **Complete** |
| **SECURITY.md** | Vulnerability reporting | **Complete** |
| **CONTRIBUTING.md** | Contribution workflow | **Complete** |
| **ARCHITECTURE.md** | Package map, diagrams | **Complete** |
| **ROADMAP.md** | Planned work | **Complete** |
| **RELEASE.md** | Release process, first-release checklist | **Complete** |

---

## Phase Delivery Summary

*Note: Phases are inferred from implementation structure; no explicit phase tracking exists in the repository.*

### Phase 0: Foundation / Monorepo Setup

**Goal:** Establish monorepo structure, tooling, and base config.

**Created:** pnpm-workspace, turbo.json, tsconfig.base.json, package.json, Makefile, eslint-config, commitlint, husky, prettier.

**Status:** **Complete**

---

### Phase 1: Shared Types and Canton Clients

**Goal:** Shared TypeScript types and Canton API clients.

**Created:** shared-types (PartyId, CantonConfig, DTOs), canton-client (JSON Ledger API v2), validator-client, scan-client, fetchWithRetry, error types.

**Status:** **Complete**

---

### Phase 2: Daml Contract Layer

**Goal:** Daml models for swap and token flows.

**Created:** daml-models (Types, QuoteRequest, SwapIntent, SettlementInstruction, TokenIntent, TransferApproval, AppConnection, PartyProfile, AppRegistry, AuditEvent).

**Status:** **Complete**

---

### Phase 3: Wallet Abstraction

**Goal:** CIP-103 wallet abstraction and mock implementation.

**Created:** wallet-adapter (IWalletProvider, MockWalletAdapter, WalletEventEmitter, DappSdkAdapter/WalletSdkAdapter stubs).

**Status:** **Complete** (mock); real adapters **Scaffold Only**

---

### Phase 4: Token Standard Abstraction

**Goal:** CIP-0056 token operations.

**Created:** token-standard (schemas, mappers, settlement, swapLegs, aggregateHoldingsToBalances).

**Status:** **Complete**

---

### Phase 5: Party Identity

**Goal:** User–party mapping and permissions.

**Created:** party-identity (PartyIdentityService, InMemoryStore, allocateParty, inspectPermissions, listAllParties).

**Status:** **Complete**

---

### Phase 6: Swap Engine

**Goal:** Quote/deal orchestration and state machine.

**Created:** swap-engine (QuoteService, DealService, SwapEngine, InMemoryStore, state machine, events, createSettlementInstruction).

**Status:** **Complete**

---

### Phase 7: API Layer

**Goal:** Fastify API with all modules.

**Created:** app.ts, context.ts, auth, users, parties, wallet, tokens, swaps, network, admin, admin-ops routes. Env config, correlation middleware, error handler, rate limiting (optional), Swagger.

**Status:** **Complete**

---

### Phase 8: Auth Strategy

**Goal:** Token validation (JWT or dev opaque).

**Created:** auth.strategy.ts (createJwtValidator, createDevTokenValidator), auth.middleware (uses ctx.authValidator), JWT via jose.

**Status:** **Complete**

---

### Phase 9: Frontend

**Goal:** Reference web app with full flows.

**Created:** Next.js app (layout, pages, hooks, components, providers). Pages: /, /connect, /dashboard, /wallet, /tokens, /swaps, /swaps/new, /swaps/[dealId], /admin/network, /admin/ops, /dev/contracts.

**Status:** **Complete**

---

### Phase 10: Observability

**Goal:** Logging, correlation IDs, metrics stubs.

**Created:** observability (createStructuredLogger, redaction, correlation, OTEL stubs, Prometheus stubs).

**Status:** **Complete**

---

### Phase 11: Security Hardening

**Goal:** JWT, rate limiting, mTLS config, secure logging, docs.

**Created:** JWT validation path, rate limit env, mTLS env vars, secure logging (redaction), secure env templates, docs (security-model, key-management-boundaries, deployment-trust-boundaries, production-hardening-checklist), SECURITY.md.

**Status:** **Mostly Complete** — mTLS not wired to clients; CORS_ORIGINS not implemented

---

### Phase 12: Operational Layer

**Goal:** Ops dashboard, error/command tracking, runbooks.

**Created:** OpsStore, admin-ops routes (/ops/health, /ops/errors, /ops/commands, /ops/swaps, /ops/parties), admin/ops page, runbooks, local-ops, observability docs.

**Status:** **Complete**

---

### Phase 13: Examples and Integrations

**Goal:** Prove reusability via thin clients.

**Created:** example-wallet, example-swap-flow, example-app-onboarding (run.ts, README, ARCHITECTURE), integrations/api-client, integrations/quickstart-overlay, docs/examples-index.

**Status:** **Complete**

---

### Phase 14: Testing

**Goal:** Unit, integration, E2E tests.

**Created:** Unit tests (swap-engine, party-identity, token-standard, wallet-adapter, observability, validator-client, scan-client, canton-client, test-utils). Integration tests (flows.test.ts), E2E (happy-path.test.ts). MockValidatorClient, MockScanClient, MockLedgerTransport, Daml fixtures.

**Status:** **Mostly Complete** — Some packages (party-identity, token-standard) have pre-existing build/test issues; coverage varies

---

### Phase 15: Documentation

**Goal:** Comprehensive docs for builders.

**Created:** docs/ (35+ files), architecture, API, Daml, wallet, token, swap, identity, frontend, security, ops, testing, examples. README, ARCHITECTURE. md, CONTRIBUTING.md, ROADMAP.md, RELEASE.md.

**Status:** **Complete**

---

### Phase 16: Release Preparation

**Goal:** Forkable starter kit with release checklist.

**Created:** README rewrite, ARCHITECTURE.md, CONTRIBUTING.md, ROADMAP.md, RELEASE.md, docs/first-release-checklist.md, CI workflow.

**Status:** **Complete**

---

## Architecture Summary

### Monorepo Structure

The repository is a pnpm workspace with Turborepo. `apps/` contains deployable applications (api, web, admin, docs-site). `packages/` contains shared libraries. `examples/` and `integrations/` contain reference implementations and integration components. Dependencies flow from shared-types and core packages upward; the API aggregates packages and exposes them via HTTP.

### Daml Contract Layer

The `daml-models` package defines Daml templates for the swap and token domain: QuoteRequest (initiator/counterparty, AcceptQuote/RejectQuote), SwapIntent (or SwapProposal), SettlementInstruction (FinalizeSwap), TokenIntent, TransferApproval, AppConnection, PartyProfile, AppRegistry, AuditEvent. These are the ledger primitives; the TypeScript swap-engine orchestrates the equivalent flow in application state before (or instead of) ledger submission.

### JSON Ledger API v2 Layer

The `canton-client` package provides a typed client for the Canton JSON Ledger API v2: submitAndWait, submitAndWaitForTransaction, getEventsByContractId, getActiveContracts, and command builders (createCommand, exerciseCommand, createAndExerciseCommand). It uses fetchWithRetry with timeout, auth, and retries. The API does not currently use this client for ledger submission; the swap-engine produces settlement instructions that would be submitted via this client when wired.

### Scan/Validator Clients

The `validator-client` fetches validator user data and DSO party ID from the Validator API. The `scan-client` fetches scans and transfer registry info. Both are used by the `network` module when VALIDATOR_API_URL is set. They are optional; the API runs without them using mock data.

### Wallet Abstraction

The `wallet-adapter` defines IWalletProvider (connect, getSession, prepareTransaction, requestSigning, getHoldings). MockWalletAdapter implements this for local development. DappSdkAdapter and WalletSdkAdapter are stubs that throw "implement via token standard." The API uses the wallet provider for session and holdings; the tokens module uses it for holdings and aggregates via token-standard.

### Token Standard Abstraction

The `token-standard` package provides CIP-0056-aligned schemas, mappers, and settlement utilities. It aggregates holdings to balances and builds swap legs for settlement. The swap-engine uses it to create settlement instructions.

### Swap Engine

The `swap-engine` orchestrates the quote-to-settlement flow: requestQuote, respondToQuote, acceptQuote, rejectQuote, recordPreCheck, recordApproval, createSettlementInstruction, cancelDeal, confirmSettlement. It uses a state machine and persistence interface (ISwapEngineStore). The InMemoryStore is the default; SQL or event-store implementations would be added for production.

### Identity/Party Onboarding

The `party-identity` package provides PartyIdentityService: createUser, allocateParty, getPrimaryParty, inspectPermissions, listAllParties. It maps app users to Canton parties and supports admin/custodian roles. The API uses it for auth (via userId in dev) and party allocation.

### API Layer

The Fastify API is the single entry point. It registers auth, users, parties, wallet, tokens, swaps, network, admin, and admin-ops routes. The context holds identity, swapEngine, walletProvider, validatorClient, opsStore, and authValidator. Correlation middleware adds x-correlation-id. Error handler records errors to opsStore. Rate limiting is optional via env.

### Frontend Layer

The Next.js app uses App Router, TanStack Query, React Hook Form, and Zod. It has pages for onboarding, wallet, tokens, swaps, and admin. The Shell provides navigation. Hooks (useAuth, useUsers, useParties, useWallet, useTokens, useSwaps, useNetwork, useOps) wrap the API. Components include TransactionReview, EventTimeline, and shared UI states.

### Observability and Ops

The observability package provides structured logging with redaction, correlation IDs, and OTEL/metrics stubs. The ops layer includes OpsStore (errors, commands), admin-ops routes, and an ops dashboard. Infra has Prometheus and Grafana docker-compose; the API does not yet expose /metrics.

### Security Boundaries

Security docs describe auth strategy (JWT vs dev opaque), role/permission model, trust boundaries, key management, and deployment trust. JWT validation exists when AUTH_JWT_SECRET is set. Rate limiting is configurable. mTLS env vars exist but are not wired to Canton clients. Secure logging redacts sensitive keys.

---

## Gap Analysis

### Missing Implementation Areas

- **Ledger submission** — The swap-engine creates settlement instructions but does not submit them via canton-client. No wiring from deal to ledger.
- **Persistent stores** — InMemoryStore for swap-engine and party-identity; no SQL or event-store adapters.
- **Real wallet adapter** — DappSdkAdapter and WalletSdkAdapter are stubs. MockWalletAdapter is the only working implementation.
- **JWT issuance** — JWT verification exists; no issuance endpoint or OIDC integration.
- **CORS_ORIGINS** — Env var defined; not used to restrict CORS in production.
- **API /metrics endpoint** — Prometheus expects it; not implemented.

### Placeholder Logic

- **Mock auth** — Bearer token = userId in dev; no token verification when AUTH_JWT_SECRET is unset.
- **SEED_ADMIN_EXTERNAL_ID** — Dev shortcut for admin role; must be removed in production.
- **MockWalletAdapter** — Returns fixed party and holdings; no real wallet connectivity.

### Weak Spots

- **party-identity** and **token-standard** — Some pre-existing TypeScript/build issues (exactOptionalPropertyTypes, BigInt with decimals) may cause test failures.
- **quickstart-overlay** — Depends on external cn-quickstart; bootstrap/validate scripts may not run without that setup.
- **admin app** — Separate from web; potential overlap with web's /admin/ops.

### Risky Assumptions

- **Canton not required for dev** — Mock wallet and in-memory stores allow development without Canton. Real ledger integration is untested.
- **Validator/Scan optional** — Network module returns placeholder data when URLs are not set; no validation of real API responses.
- **Single participant** — Architecture assumes single-participant or minimal multi-party; no explicit multi-domain modeling.

### Areas Needing Canton Environment Verification

- Validator API responses (normalization, error handling)
- Scan API responses
- Ledger API submitAndWait with real Daml contracts
- Wallet connectivity and signing flow with real wallet gateway

### Parts Not Yet Production-Safe

- In-memory stores (data lost on restart)
- Mock auth (no real identity provider)
- Mock wallet (no real signing)
- CORS: origin true (no restriction)
- Rate limiting off by default
- No /metrics endpoint
- No mTLS wiring for Canton clients

---

## Production Readiness Assessment

| Category | Score (1–10) | Rationale |
|----------|--------------|------------|
| **Architecture clarity** | 8 | Clear package boundaries, API-centric design, documented. Some mTLS/CORS TODOs. |
| **Developer experience** | 8 | One-command setup, examples, docs. Some build/test issues in packages. |
| **Reusability** | 8 | Packages are encapsulated; examples prove API contract. Real adapters are stubs. |
| **Test coverage confidence** | 6 | Unit tests for most packages; integration and E2E exist. Some packages have failing tests. Coverage varies. |
| **Operational readiness** | 6 | Ops dashboard, runbooks, health endpoints. No /metrics, no persistent error storage. |
| **Security readiness** | 6 | JWT path, rate limiting, secure logging, docs. mTLS not wired; CORS not restricted; dev shortcuts present. |
| **Canton ecosystem alignment** | 7 | JSON Ledger API v2, CIP-0056, CIP-103 abstractions. Ledger submission not wired; no real Canton validation. |

**Overall readiness:** **6–7 / 10**. The repository is a strong starter kit for development and prototyping. Production deployment requires: persistent stores, real wallet adapter, ledger submission wiring, JWT issuance or IdP integration, CORS restriction, rate limiting enabled, and Canton environment verification.

---

## Builder Usability Assessment

### Wallet-enabled app

**Ready:** API has /wallet/connect, /wallet/session; tokens module has holdings/balances. Web app has wallet page and connect flow. MockWalletAdapter works for local dev.

**Needs work:** Replace MockWalletAdapter with DappSdkAdapter or WalletSdkAdapter; configure wallet gateway.

### Token-based app

**Ready:** token-standard package, token schemas, holdings/balances aggregation. API exposes /tokens/holdings and /tokens/balances. Web has tokens page.

**Needs work:** Real ledger data (holdings come from wallet provider; with mock, data is fixed). Wire Canton for real token state.

### Swap/RFQ style app

**Ready:** swap-engine (quote, respond, accept, deal), API routes, web pages for swap list, new quote, deal detail. TransactionReview, EventTimeline. Full flow works with mock data.

**Needs work:** Ledger submission for settlement. No persistence of deals across restarts.

### Onboarding/admin flow

**Ready:** User creation (login), party allocation, wallet connect. Admin routes (health, ops), admin/ops page. Party audit, swap states, errors, commands.

**Needs work:** Real IdP for auth. Admin role via SEED_ADMIN_EXTERNAL_ID is dev-only.

### Serious internal prototype

**Ready:** Yes. A team can fork, run locally, and extend.

**Needs work:** For production-like prototype: persistent stores, real wallet adapter, ledger submission wiring, JWT or IdP. For demo to stakeholders: current state is sufficient with mock data.

---

## Recommended Next Actions

### Immediate

1. **Fix failing tests** — Resolve party-identity and token-standard build/test issues (exactOptionalPropertyTypes, BigInt with decimals).
2. **Wire ledger submission** — Connect swap-engine createSettlementInstruction to canton-client submitAndWait; validate with Canton sandbox or local participant.
3. **Add /metrics endpoint** — Expose Prometheus metrics when RATE_LIMIT or metrics are enabled; complete infra/observability stack.

### Next

4. **CORS_ORIGINS** — Implement CORS restriction from env when CORS_ORIGINS is set.
5. **mTLS wiring** — Pass MTLS_CLIENT_CERT_PATH, MTLS_CLIENT_KEY_PATH to validator-client and canton-client when configured.
6. **Persistent store option** — Add SQL adapter for swap-engine and party-identity; document migration from in-memory.

### Later

7. **Real wallet adapter** — Implement DappSdkAdapter or WalletSdkAdapter; document wallet gateway setup.
8. **JWT issuance or OIDC guide** — Document how to issue JWTs or integrate with IdP.
9. **Browser E2E** — Add Playwright tests for web app flows.
10. **Canton LocalNet setup** — Scripts or docker-compose for local Canton participant for integration testing.

---

## Appendix: Key Files and Modules

### Root

| File | Description |
|------|-------------|
| package.json | Root scripts, turbo, devDependencies |
| pnpm-workspace.yaml | Workspace: apps, packages, examples, integrations |
| turbo.json | Turborepo task pipeline |
| tsconfig.base.json | Strict TypeScript base config |
| Makefile | Developer commands (install, build, dev, lint, test) |
| README.md | Project overview, quick start, package map, extension guide |
| ARCHITECTURE.md | Package map, dependency graph, data flow |
| CONTRIBUTING.md | Contribution workflow |
| ROADMAP.md | Planned work |
| RELEASE.md | Release process, first-release checklist |
| SECURITY.md | Vulnerability reporting |

### apps/api

| File | Description |
|------|-------------|
| src/app.ts | Fastify app factory, route registration, middleware |
| src/context.ts | App context (identity, swapEngine, walletProvider, validatorClient, opsStore, authValidator) |
| src/index.ts | Server entry point |
| src/config/env.ts | Typed environment validation |
| src/middleware/correlation.ts | Correlation ID middleware |
| src/ops/OpsStore.ts | Ring buffer for errors and commands |
| src/modules/auth/auth.routes.ts | Login, /me |
| src/modules/auth/auth.middleware.ts | Bearer token validation |
| src/modules/auth/auth.strategy.ts | JWT vs dev token validator |
| src/modules/users/users.routes.ts | User CRUD |
| src/modules/parties/parties.routes.ts | Party allocation, list, primary |
| src/modules/wallet/wallet.routes.ts | Session, connect, disconnect, link |
| src/modules/tokens/tokens.routes.ts | Holdings, balances |
| src/modules/swaps/swaps.routes.ts | Quotes, respond, accept, reject, deals, cancel |
| src/modules/network/network.routes.ts | Validator metadata, config |
| src/modules/admin/admin.routes.ts | Health detailed, users/parties |
| src/modules/admin/admin-ops.routes.ts | Ops health, errors, commands, swaps, parties |
| src/integration/flows.test.ts | Integration tests for API flows |
| src/e2e/happy-path.test.ts | E2E happy path scenario |

### apps/web

| File | Description |
|------|-------------|
| src/app/layout.tsx | Root layout, providers, Shell |
| src/app/page.tsx | Home |
| src/app/connect/page.tsx | Login |
| src/app/dashboard/page.tsx | User, primary party |
| src/app/wallet/page.tsx | Wallet session, connect |
| src/app/tokens/page.tsx | Balances, holdings |
| src/app/swaps/page.tsx | Swap list |
| src/app/swaps/new/page.tsx | Quote request form |
| src/app/swaps/[dealId]/page.tsx | Deal detail, TransactionReview, EventTimeline |
| src/app/admin/network/page.tsx | Network diagnostics |
| src/app/admin/ops/page.tsx | Ops dashboard |
| src/app/dev/contracts/page.tsx | Dev panel placeholder |
| src/lib/api.ts | API client (apiGet, apiPost, apiPatch) |
| src/hooks/useAuth.ts | Auth hook |
| src/hooks/useUsers.ts | useUser, useCreateUser |
| src/hooks/useParties.ts | useParties, usePrimaryParty, useAllocateParty |
| src/hooks/useWallet.ts | useWalletSession, useConnectWallet |
| src/hooks/useTokens.ts | useHoldings, useBalances |
| src/hooks/useSwaps.ts | useDeal, useRequestQuote, useRespondQuote, useAcceptQuote, useCancelDeal |
| src/hooks/useNetwork.ts | useNetworkMetadata, useNetworkConfig |
| src/hooks/useOps.ts | useOpsHealth, useOpsErrors, useOpsCommands, useOpsSwaps, useOpsParties |
| src/components/ui/Shell.tsx | Sidebar nav, user area |
| src/components/forms/LoginForm.tsx | Login form (Zod) |
| src/components/forms/QuoteRequestForm.tsx | Quote request form |
| src/components/transaction/TransactionReview.tsx | Legs table, confirm/reject |
| src/components/timeline/EventTimeline.tsx | Event list |

### packages

| Package | Key Files |
|---------|-----------|
| canton-client | client.ts, commands.ts, fetch.ts, errors.ts, types.ts |
| validator-client | client.ts, normalize.ts, types.ts |
| scan-client | client.ts, normalize.ts, types.ts |
| wallet-adapter | MockWalletAdapter.ts, DappSdkAdapter.ts, WalletSdkAdapter.ts, WalletEventEmitter.ts |
| token-standard | schemas/, mappers/, utils/settlement.ts |
| swap-engine | SwapEngine.ts, QuoteService.ts, DealService.ts, domain/models.ts, persistence/InMemoryStore.ts |
| party-identity | PartyIdentityService.ts, InMemoryStore.ts, models/ |
| observability | index.ts, logger.ts, correlation.ts, otel.ts, metrics.ts |
| shared-types | index.ts |
| test-utils | index.ts, mocks/, fixtures/daml-payloads.ts |
| daml-models | daml/Types.daml, QuoteRequest.daml, SwapIntent.daml, SettlementInstruction.daml, etc. |

### infra

| File | Description |
|------|-------------|
| docker-compose.observability.yml | Prometheus + Grafana services |
| prometheus/prometheus.yml | Scrape config for API |
| grafana/provisioning/datasources/datasources.yml | Prometheus datasource |

### examples

| File | Description |
|------|-------------|
| example-wallet/run.ts | Wallet session + holdings/balances script |
| example-swap-flow/run.ts | RFQ → respond → accept → deal script |
| example-app-onboarding/run.ts | User → party → wallet → holdings script |

### docs (selected)

| File | Description |
|------|-------------|
| api-design.md | API design principles |
| api-modules.md | API module overview |
| security-model.md | Auth, roles, trust boundaries |
| production-hardening-checklist.md | Operator checklist |
| testing-strategy.md | Test pyramid, mocks |
| examples-index.md | Examples overview |
| swap-engine-overview.md | Swap engine architecture |
| frontend-architecture.md | Web app structure |
