# Repository Map

Structure and responsibilities of the Canton MVP monorepo.

---

## Overview

```
canton-mvp/
├── apps/                    # Deployable applications
├── packages/                # Shared libraries and config
├── integrations/            # Optional integration layers
│   └── quickstart-overlay/ # cn-quickstart overlay (optional)
├── docs/                    # Documentation
├── Makefile                 # Developer commands
├── turbo.json               # Turborepo config
├── pnpm-workspace.yaml      # Workspace definition
└── tsconfig.base.json       # Base TypeScript config
```

---

## Apps (`apps/`)

| App | Port | Purpose |
|-----|------|---------|
| **web** | 3000 | Main dApp: wallet-enabled UI, swaps, token flows |
| **api** | 8080 | Backend API: Ledger integration, party mapping, business logic |
| **admin** | 3001 | Admin dashboard: operations, monitoring |
| **docs-site** | (VitePress) | Documentation site |

---

## Packages (`packages/`)

### Canton clients

| Package | Purpose |
|---------|---------|
| **canton-client** | JSON Ledger API v2 client |
| **validator-client** | Canton Validator API client |
| **scan-client** | Scan API client (transactions, registry) |

### Wallet & tokens

| Package | Purpose |
|---------|---------|
| **wallet-adapter** | CIP-103 dApp API abstraction |
| **token-standard** | CIP-0056 token operations wrapper |
| **swap-engine** | Two-party swap orchestration |

### Shared & infra

| Package | Purpose |
|---------|---------|
| **shared-types** | Shared TypeScript types, constants |
| **observability** | Structured logging, metrics baseline |
| **test-utils** | Mocks, helpers for tests |
| **party-identity** | Auth, JWT, party mapping |

### Daml

| Package | Purpose |
|---------|---------|
| **daml-models** | Daml source + generated TypeScript types |

### Tooling

| Package | Purpose |
|---------|---------|
| **eslint-config** | Shared ESLint config (base, node, react) |

---

## Dependency graph (simplified)

```
shared-types
    ├── canton-client
    │       └── token-standard
    │               └── swap-engine
    ├── validator-client
    ├── scan-client
    ├── wallet-adapter
    ├── observability
    ├── test-utils
    ├── party-identity
    └── daml-models

web    → shared-types, wallet-adapter, canton-client
api    → canton-client, observability, party-identity, shared-types
admin  → shared-types, canton-client, validator-client
```

---

## Config files

| File | Purpose |
|------|---------|
| `tsconfig.base.json` | Strict TypeScript base config |
| `turbo.json` | Turborepo task pipeline |
| `pnpm-workspace.yaml` | Workspace package globs |
| `.prettierrc` | Prettier config |
| `commitlint.config.js` | Commit message rules |
| `.husky/*` | Pre-commit, commit-msg hooks |

---

## Naming conventions

- **Scope**: All packages use `@canton-mvp/` scope
- **Apps**: `@canton-mvp/web`, `@canton-mvp/api`, etc.
- **Env**: `LEDGER_API_URL`, `VALIDATOR_API_URL`, `SCAN_API_URL`
- **Ports**: 2xxx App User, 3xxx App Provider, 4xxx SV (per cn-quickstart)
