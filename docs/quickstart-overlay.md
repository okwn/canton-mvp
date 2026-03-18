# Quickstart Overlay Strategy

> **Purpose**: Maintainable overlay strategy for adopting CN Quickstart patterns without hard-forking. Canton MVP stays independent; Quickstart is an optional reference and runtime base.

---

## 1. Design Principles

| Principle | Implication |
|-----------|------------|
| **No hard-fork** | We do not copy cn-quickstart into canton-mvp. We reference it externally. |
| **Adapter isolation** | Quickstart-specific behavior lives behind adapters; core packages stay agnostic. |
| **Optional runtime** | canton-mvp can run standalone or on top of Quickstart LocalNet. |
| **Pattern extraction** | We borrow patterns and conventions, not implementations. |
| **Independence** | canton-mvp remains a reusable starter kit; teams can fork without Quickstart. |

---

## 2. What We Borrow from cn-quickstart

### Topology and conventions

| Borrowed | Use in canton-mvp |
|----------|-------------------|
| Port suffix scheme (901 Ledger, 902 Admin, 903 Validator, 975 JSON) | `integrations/quickstart-overlay/port-map.json` |
| Prefix convention (2xxx App User, 3xxx App Provider, 4xxx SV) | Env defaults, validation scripts |
| `*.localhost` domain mappings | Dev docs, bootstrap scripts |
| Splice LocalNet compose layout | Optional `integrations/quickstart-overlay/docker/` reference |

### Patterns (extracted, not copied)

| Pattern | How we adopt |
|---------|--------------|
| `share_file` for dynamic config | Adapter: `RuntimeConfigAdapter` that reads from shared volume or env |
| OAuth2 vs shared-secret auth modes | `@canton-mvp/party-identity` supports both; IdP is pluggable |
| Modular Docker Compose | Our own minimal compose; Quickstart layout as reference only |
| Observability stack (Grafana, Prometheus, Loki) | Optional `@canton-mvp/observability` extension; not bundled |
| Vite dev workflow | Already in apps; no Quickstart dependency |

### Documentation only

- Topology diagrams (reference)
- Port mappings (reference)
- Troubleshooting patterns (reference)

---

## 3. What We Reimplement Ourselves

| Area | canton-mvp approach | Why not use Quickstart |
|------|---------------------|------------------------|
| **Backend** | TypeScript/Node API (`apps/api`) | Quickstart uses Java/Spring Boot |
| **Ledger client** | `@canton-mvp/canton-client` (JSON API v2) | Our own, no Quickstart bindings |
| **Wallet integration** | `@canton-mvp/wallet-adapter` (CIP-103) | Abstraction over splice-wallet-kernel |
| **Token operations** | `@canton-mvp/token-standard` (CIP-0056) | Our own wrapper |
| **Auth / party mapping** | `@canton-mvp/party-identity` | Pluggable, no Keycloak coupling |
| **Daml contracts** | `packages/daml-models` | Minimal starter; no licensing workflow |
| **Build / dev tooling** | pnpm, turbo, Makefile | Our own stack |

---

## 4. What We Isolate Behind Adapters

Adapters live in `integrations/quickstart-overlay/` and keep Quickstart-specific logic out of core packages.

| Adapter | Purpose | Core package interface |
|---------|---------|-------------------------|
| **RuntimeConfigAdapter** | Resolves `APP_PROVIDER_PARTY`, validator URLs from Quickstart env/volumes | `@canton-mvp/shared-types` `CantonConfig` |
| **OnboardingAdapter** | Wraps splice-onboarding scripts if using Quickstart LocalNet | Optional; not in core |
| **PortMappingAdapter** | Maps canton-mvp port expectations to Quickstart topology | Scripts only |
| **AuthAdapter** | Bridges Quickstart OAuth2/Keycloak to `party-identity` | `PartyIdentityResolver` impl |

### Adapter contract

- Adapters implement interfaces defined in core packages.
- Adapters are **optional**; core packages work without them.
- Adapters live under `integrations/`; they are not published as `@canton-mvp/*`.

---

## 5. Integration Modes

| Mode | Description | When to use |
|------|-------------|-------------|
| **Standalone** | canton-mvp + minimal LocalNet (Splice or custom) | Default; no Quickstart |
| **Quickstart overlay** | canton-mvp apps connect to Quickstart LocalNet | When you want full Quickstart topology (SV, Scan, etc.) |
| **Reference only** | Use Quickstart docs/patterns; run our own infra | Most teams |

---

## 6. Folder Layout

```
canton-mvp/
├── apps/                    # Our apps (unchanged)
├── packages/                 # Our packages (unchanged, Quickstart-agnostic)
├── integrations/
│   └── quickstart-overlay/   # Quickstart-specific integration layer
│       ├── README.md
│       ├── sync-strategy.md
│       ├── compatibility-checklist.md
│       ├── compatibility-matrix.md
│       ├── port-map.json
│       ├── scripts/
│       │   ├── bootstrap.sh
│       │   ├── map-ports.sh
│       │   └── validate-services.sh
│       └── adapters/         # (Optional) Adapter implementations
└── docs/
    └── quickstart-overlay.md # This document
```

---

## 7. Sync Strategy with cn-quickstart

- **We do not sync** Quickstart code into canton-mvp.
- **We track** Quickstart releases for compatibility (see compatibility matrix).
- **We update** our overlay when Quickstart changes topology, ports, or APIs.
- **We document** breaking changes in `integrations/quickstart-overlay/sync-strategy.md`.

---

## 8. Decision Log

| Decision | Rationale |
|----------|-----------|
| Adapters in `integrations/` | Keeps core packages clean; adapters are optional. |
| No git submodule to Quickstart | Avoids coupling; we reference externally. |
| Port map as JSON | Scripts and docs can consume; single source of truth. |
| Compatibility matrix | Teams know what versions work together. |

---

*Last updated: March 2026.*
