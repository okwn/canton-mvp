# Testing Strategy

How Canton MVP is tested to build confidence for teams forking this starter.

## Test Pyramid

```
        E2E (happy path)
       /                 \
   Integration (API flows)
  /                           \
Unit (packages, mocks)
```

## Unit Tests

| Package | Scope | Validates |
|---------|-------|-----------|
| `swap-engine` | Quote/deal lifecycle, events | State machine, store interface |
| `party-identity` | User, party, permissions | Service logic, store |
| `token-standard` | Schemas, mappers, settlement | CIP-0056 alignment |
| `wallet-adapter` | MockWalletAdapter, events | Provider interface |
| `observability` | Logger, correlation | Redaction, ID propagation |
| `validator-client` | Normalization, fetch | API contract |
| `scan-client` | Normalization | API contract |
| `canton-client` | Commands, fetch | Ledger API contract |
| `test-utils` | Mocks, fixtures | Mock behavior |

## Integration Tests

**Location**: `apps/api/src/integration/`, `apps/api/src/e2e/`

**Scope**: Full API flows with real app context (in-memory stores).

| Flow | Validates |
|------|-----------|
| Onboarding | Auth → party allocation → primary party |
| Wallet connect | Connect → session → holdings |
| Quote request | Request → respond → accept → deal |
| Settlement prep | Deal has giveLeg/receiveLeg |

**Architecture boundaries**: Tests assert that auth, parties, wallet, tokens, and swaps modules work together via the API. No mocking of internal packages.

## E2E Happy Path

**Location**: `apps/api/src/e2e/happy-path.test.ts`

Single scenario: onboarding → wallet connect → quote request → accept → settlement preparation.

Proves the full stack works end-to-end in one run.

## Mocks and Fixtures

| Mock | Purpose |
|------|---------|
| `MockWalletAdapter` | Wallet provider for dev/tests (in wallet-adapter) |
| `MockValidatorClient` | Validator API without network (in test-utils) |
| `MockScanClient` | Scan API without network (in test-utils) |
| `createMockLedgerFetch` | Ledger API transport (in test-utils) |
| `daml-payloads` | Sample Daml JSON for commands (in test-utils) |

See [docs/mocking-guide.md](mocking-guide.md).

## Running Tests

```bash
# All packages + API
pnpm test

# Single package
pnpm --filter @canton-mvp/swap-engine test

# API only
pnpm --filter @canton-mvp/api test

# With coverage
pnpm test:coverage
```

## CI

GitHub Actions: build → lint → test on push/PR to main and develop.

See `.github/workflows/ci.yml`.
