# JSON Ledger API v2

Reference for Canton JSON Ledger API v2 as used by `@canton-mvp/canton-client`.

---

## Overview

The JSON Ledger API v2 is the HTTP REST interface for Canton participant nodes. It replaces gRPC for web and serverless clients. canton-mvp uses **v2 only**; v1 is deprecated.

**Base path**: `{ledgerApiUrl}/v2`

**Auth**: Bearer token in `Authorization` header.

---

## Endpoints Used by canton-client

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v2/version` | Node version |
| POST | `/v2/commands/submit-and-wait` | Submit commands, wait for completion |
| POST | `/v2/commands/submit-and-wait-for-transaction` | Submit commands, wait for full transaction |
| POST | `/v2/events/events-by-contract-id` | Get events for a contract |
| POST | `/v2/state/active-contracts` | Query active contracts |
| POST | `/v2/commands/completions` | Poll completions (blocking) |

---

## Commands

### JsCommands

```json
{
  "commandId": "uuid",
  "commands": [ { "CreateCommand": { ... } } ],
  "actAs": ["PartyId"],
  "userId": "optional",
  "readAs": ["optional"]
}
```

### CreateCommand

```json
{
  "CreateCommand": {
    "templateId": "ModuleName:TemplateName",
    "createArguments": { "field": "value" }
  }
}
```

### ExerciseCommand

```json
{
  "ExerciseCommand": {
    "templateId": "ModuleName:TemplateName",
    "contractId": "#contractId",
    "choice": "ChoiceName",
    "choiceArgument": { "arg": "value" }
  }
}
```

### CreateAndExerciseCommand

```json
{
  "CreateAndExerciseCommand": {
    "templateId": "ModuleName:TemplateName",
    "createArguments": { ... },
    "choice": "ChoiceName",
    "choiceArgument": { ... }
  }
}
```

---

## Submit-and-Wait Flow

1. **submit-and-wait**: Returns completion details (commandId, updateId, status).
2. **submit-and-wait-for-transaction**: Returns full transaction with events.

For most app flows, `submit-and-wait-for-transaction` is preferred when you need created contract IDs or exercise results.

---

## Active Contracts

Request:

```json
{
  "requestingParties": ["PartyId"],
  "filter": {
    "inclusive": {
      "templateIds": ["ModuleName:TemplateName"]
    }
  },
  "offset": "optional"
}
```

Response: Array of `{ offset, activeContracts: [...] }`.

---

## Events by Contract ID

Request:

```json
{
  "contractId": "#contractId",
  "requestingParties": ["PartyId"]
}
```

Returns created and exercised events for the contract.

---

## Completions Polling

For async submit + poll flow:

1. POST to `/v2/commands/async/submit` (async).
2. POST to `/v2/commands/completions` with `{ parties, beginExclusive }` to poll.

canton-client supports the completions endpoint for polling when you need to wait for an externally-signed command.

---

## Daml-LF JSON Encoding

Template arguments and choice arguments use [Daml-LF JSON encoding](https://docs.digitalasset.com/build/3.4/reference/json-api/lf-value-specification.html). Key points:

- Party: `"PartyId"`
- ContractId: `"#hash"`
- Optional: `null` or `{ "Some": value }`
- List: `[ ... ]`
- Record: `{ "field": value }`

---

## References

- [JSON Ledger API OpenAPI](https://docs.digitalasset.com/build/3.4/reference/json-api/openapi.html)
- [Daml-LF JSON spec](https://docs.digitalasset.com/build/3.4/reference/json-api/lf-value-specification.html)
