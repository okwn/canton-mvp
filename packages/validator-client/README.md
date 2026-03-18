# @canton-mvp/validator-client

Typed client for Canton Validator API. Provides a clean abstraction over validator endpoints for user data, DSO party resolution, and validator metadata.

## Features

- **Typed**: Normalized DTOs from `@canton-mvp/shared-types`
- **Transport**: Auth, retry, timeout via `@canton-mvp/canton-client`
- **Change-tolerant**: Raw API shapes separated from app-facing types

## Domain Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getValidatorUser()` | `ValidatorUserInfo` | Authenticated user (userId, primaryParty) |
| `getDsoPartyId()` | `DsoPartyInfo` | DSO party ID (via scan-proxy BFT) |
| `getValidatorPartyMetadata()` | `{ validatorUser, dsoParty }` | Combined validator + DSO metadata |

## Usage

```typescript
import { ValidatorClient } from "@canton-mvp/validator-client";
import type { CantonConfig } from "@canton-mvp/shared-types";

const config: CantonConfig = {
  ledgerApiUrl: "http://canton:2975",
  validatorApiUrl: "http://canton:2903",
};

const client = ValidatorClient.fromConfig(config, authToken);
const user = await client.getValidatorUser();
const dso = await client.getDsoPartyId();
```

## Composing with Wallet / Swap

Use `getValidatorUser()` for party mapping (JWT → party). Use `getDsoPartyId()` for token admin resolution (CIP-0056 instrument IDs). Use `getValidatorPartyMetadata()` when both are needed.
