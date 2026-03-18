# Mocking Guide

How to use mocks for Canton MVP tests.

## Mock Wallet Adapter

**Package**: `@canton-mvp/wallet-adapter`

```ts
import { MockWalletAdapter } from "@canton-mvp/wallet-adapter";

const wallet = new MockWalletAdapter({
  defaultPartyId: "Alice::1220...",
  defaultUserId: "user-1",
  simulateDelayMs: 0, // no delay in tests
});

const session = await wallet.getSession();
const connection = await wallet.connect();
const holdings = await wallet.getHoldings(connection.session.partyId);
```

**Demo-only**: Use `DappSdkAdapter` or `WalletSdkAdapter` in production.

## Mock Validator Client

**Package**: `@canton-mvp/test-utils`

```ts
import { MockValidatorClient } from "@canton-mvp/test-utils";

const client = new MockValidatorClient({
  validatorUser: { userId: "u1", primaryParty: "Alice::1220..." },
  dsoPartyId: "DSO::1220...",
});

const user = await client.getValidatorUser();
const dso = await client.getDsoPartyId();
```

Use when the API context would use ValidatorClient but you want to avoid network calls.

## Mock Scan Client

**Package**: `@canton-mvp/test-utils`

```ts
import { MockScanClient } from "@canton-mvp/test-utils";

const client = new MockScanClient({
  scans: [{ scanId: "s1", url: "http://scan.test" }],
});

const scans = await client.getScans();
const registry = client.getTransferRegistryInfo();
```

## Mock Ledger Transport

**Package**: `@canton-mvp/test-utils`

```ts
import { createMockLedgerFetch } from "@canton-mvp/test-utils";

const mockFetch = createMockLedgerFetch({
  "/v2/version": { major: "2", minor: "0" },
  "/v2/commands/submit-and-wait": {
    completions: [{ commandId: "cmd-1", status: { status: "OK" } }],
  },
});

// In test
vi.stubGlobal("fetch", mockFetch);
```

Use when testing code that calls the Canton Ledger API (e.g. canton-client).

## Daml Payload Fixtures

**Package**: `@canton-mvp/test-utils`

```ts
import {
  CREATE_QUOTE_REQUEST,
  EXERCISE_FINALIZE_SWAP,
  SUBMIT_AND_WAIT_COMMANDS,
  ALICE_PARTY,
  BOB_PARTY,
  INSTRUMENT_USD,
} from "@canton-mvp/test-utils";
```

Use for building Ledger API command payloads in tests.

## When to Mock

| Layer | Mock? | Reason |
|-------|-------|--------|
| API routes | No | Use real app, in-memory stores |
| Wallet provider | MockWalletAdapter | No real wallet in CI |
| Validator/Scan | Mock when testing API with validator | Avoid external deps |
| Ledger fetch | Mock when testing canton-client | Avoid ledger in CI |
