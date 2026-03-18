# @canton-mvp/scan-client

Typed client for Canton Scan API. Provides a clean abstraction over Scan endpoints for network metadata, scans inspection, and transfer registry info.

## Features

- **Typed**: Normalized DTOs from `@canton-mvp/shared-types`
- **Transport**: Auth, retry, timeout via `@canton-mvp/canton-client`
- **Change-tolerant**: Raw API shapes separated from app-facing types

## Domain Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getScans()` | `ScanList` | List of scan services |
| `getNetworkMetadata()` | `ScanList` | Network/synchronizer metadata |
| `getTransferRegistryInfo()` | `TransferRegistryInfo` | Transfer factory URL for token flows |

## Usage

```typescript
import { ScanClient } from "@canton-mvp/scan-client";
import type { CantonConfig } from "@canton-mvp/shared-types";

const config: CantonConfig = {
  ledgerApiUrl: "http://canton:2975",
  scanApiUrl: "http://scan:4000",
};

const client = ScanClient.fromConfig(config, authToken);
const scans = await client.getScans();
const registry = client.getTransferRegistryInfo();
```

## Composing with Wallet / Swap

Use `getTransferRegistryInfo()` for token transfer flows. Use `getScans()` for network discovery and health checks.
