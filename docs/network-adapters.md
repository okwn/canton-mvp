# Network Adapters

Overview of `@canton-mvp/scan-client` and `@canton-mvp/validator-client` as internal abstractions over Scan API and Validator API.

---

## Design Principles

| Principle | Implementation |
|-----------|----------------|
| **No raw HTTP shapes in app logic** | All responses normalized to `@canton-mvp/shared-types` DTOs |
| **Change tolerance** | Raw transport types in `*/types.ts`; normalizers in `*/normalize.ts` |
| **Composability** | Adapters expose domain methods; wallet and swap layers consume DTOs only |
| **Consistent transport** | Auth, retry, timeout via `fetchWithRetry` from `@canton-mvp/canton-client` |

---

## Package Overview

| Package | Purpose |
|---------|---------|
| **scan-client** | Scan API: scans, network metadata, transfer registry |
| **validator-client** | Validator API: validator user, DSO party, scan-proxy |

---

## Normalized DTOs (shared-types)

App-facing types used by wallet, swap, and app layers:

| DTO | Used by | Description |
|-----|---------|-------------|
| `NetworkMetadata` | Both | synchronizerId, domainId, participantId |
| `ScanInfo` | scan-client | scanId, url, synchronizerId |
| `ScanList` | scan-client | List of ScanInfo |
| `ValidatorUserInfo` | validator-client | userId, primaryParty, identityProviderId |
| `DsoPartyInfo` | validator-client | dsoPartyId, svPartyId |
| `TokenInstrumentInfo` | Both | adminPartyId, symbol (CIP-0056) |
| `TransferRegistryInfo` | scan-client | transferFactoryUrl, registryPartyId |

---

## Scan Client

### Domain Methods

| Method | Returns | Use Case |
|--------|---------|----------|
| `getScans()` | `ScanList` | Inspect available scan services |
| `getNetworkMetadata()` | `ScanList` | Network/synchronizer discovery |
| `getTransferRegistryInfo()` | `TransferRegistryInfo` | Token transfer factory URL |

### Raw → Normalized

- `RawScansResponse` (array or `{ scans }`) → `ScanList`
- Handles snake_case and camelCase from API

### Composing with Wallet / Swap

- **Wallet**: Use `getTransferRegistryInfo()` for external token transfer flows
- **Swap**: Use `getScans()` for network health; transfer registry for settlement

---

## Validator Client

### Domain Methods

| Method | Returns | Use Case |
|--------|---------|----------|
| `getValidatorUser()` | `ValidatorUserInfo` | Map JWT → party for auth |
| `getDsoPartyId()` | `DsoPartyInfo` | Resolve DSO party (token admin) |
| `getValidatorPartyMetadata()` | `{ validatorUser, dsoParty }` | Combined metadata |

### Raw → Normalized

- `RawValidatorUser` → `ValidatorUserInfo`
- `RawDsoPartyIdResponse` (string or `{ dso_party_id }`) → `DsoPartyInfo`

### Composing with Wallet / Swap

- **Wallet**: Use `getValidatorUser()` for party mapping; `getDsoPartyId()` for CIP-0056 instrument admin
- **Swap**: Use `getValidatorPartyMetadata()` when setting up token flows

---

## Transport

Both clients use `fetchWithRetry` from `@canton-mvp/canton-client`:

- **Auth**: Bearer token
- **Retry**: 3 attempts, exponential backoff
- **Timeout**: 30s default
- **Logging hooks**: `onRetry`, `onRequest`, `onResponse`

---

## Configuration

```typescript
import { ScanClient, ValidatorClient } from "@canton-mvp/...";
import type { CantonConfig } from "@canton-mvp/shared-types";

const config: CantonConfig = {
  ledgerApiUrl: "http://canton:2975",
  validatorApiUrl: "http://canton:2903",
  scanApiUrl: "http://scan:4000",
};

const scan = ScanClient.fromConfig(config, authToken);
const validator = ValidatorClient.fromConfig(config, authToken);
```

---

## Error Handling

Both clients throw `CantonClientError` (and subclasses) from `@canton-mvp/canton-client`. See [client-error-model.md](client-error-model.md).

---

## Extending

To add new domain methods:

1. Add raw types in `packages/*/src/types.ts`
2. Add normalizer in `packages/*/src/normalize.ts`
3. Add normalized DTO to `shared-types` if app-facing
4. Add domain method in `packages/*/src/client.ts`
