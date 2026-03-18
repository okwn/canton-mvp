# Canton Client Error Model

Structured error handling for `@canton-mvp/canton-client`.

---

## Error Hierarchy

```
CantonClientError (base)
├── CantonTimeoutError
└── CantonNetworkError
```

---

## CantonClientError

Base error for all client failures.

| Property | Type | Description |
|----------|------|-------------|
| `message` | string | Human-readable message |
| `code` | string | Error code (e.g. `INVALID_ARGUMENT`, `HTTP_ERROR`) |
| `cause` | string | Underlying cause from API or network |
| `context` | Record<string, string> | Additional context (from JsCantonError) |
| `statusCode` | number? | HTTP status code |
| `retryable` | boolean | Whether the operation can be retried |

### Static Methods

**fromPayload(payload, statusCode?)**

Creates from Canton API error payload (JsCantonError):

```typescript
const err = CantonClientError.fromPayload(
  { code: "INVALID_ARGUMENT", cause: "Bad template ID" },
  400
);
```

**fromResponse(statusCode, body)**

Parses JSON error body or falls back to plain text:

```typescript
const err = CantonClientError.fromResponse(500, '{"code":"X","cause":"Y"}');
```

---

## CantonTimeoutError

Thrown when the request exceeds `timeoutMs`.

- `retryable`: true
- `code`: `"TIMEOUT"`

---

## CantonNetworkError

Thrown when fetch fails (connection refused, DNS, etc.).

- `retryable`: true
- `code`: `"NETWORK_ERROR"`

---

## JsCantonError (API Payload)

Canton returns errors as:

```json
{
  "code": "INVALID_ARGUMENT",
  "cause": "Template ID not found",
  "context": { "templateId": "Main:Asset" },
  "errorCategory": 1,
  "correlationId": "...",
  "traceId": "...",
  "retryInfo": "...",
  "definiteAnswer": false
}
```

- `definiteAnswer: false` → retryable
- `definiteAnswer: true` → non-retryable (e.g. validation error)

---

## Retry Behavior

The client retries when:

1. HTTP status is 429, 503, or 504
2. `CantonClientError.retryable` is true
3. Network/timeout errors (always retryable)

Defaults: 3 retries, exponential backoff (1s, 2s, 4s).

---

## Usage

```typescript
import {
  CantonLedgerClient,
  CantonClientError,
  CantonTimeoutError,
} from "@canton-mvp/canton-client";

try {
  const result = await client.submitAndWait(commands);
} catch (e) {
  if (e instanceof CantonTimeoutError) {
    console.error("Request timed out, consider increasing timeout");
  } else if (e instanceof CantonClientError) {
    console.error(e.code, e.cause, e.statusCode);
    if (e.retryable) {
      // Consider retrying
    }
  }
  throw e;
}
```
