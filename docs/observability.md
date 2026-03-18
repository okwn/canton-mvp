# Observability

Structured logging, correlation IDs, OpenTelemetry hooks, and Prometheus metrics for Canton MVP.

## Correlation IDs

All API requests receive an `x-correlation-id` header (or propagate an existing one). Use it to trace operations across:

- **API** – request handling, error recording
- **Wallet** – connect, disconnect, signing
- **Ledger** – command submission (when wired)

### Usage

```ts
import { getOrCreateCorrelationId, CORRELATION_HEADER } from "@canton-mvp/observability";

// In middleware: extract or create
const correlationId = getOrCreateCorrelationId(req.headers);

// Pass to downstream calls (wallet, ledger)
headers[CORRELATION_HEADER] = correlationId;
```

## Structured Logging

```ts
import { createStructuredLogger } from "@canton-mvp/observability";

const log = createStructuredLogger("api", { correlationId });
log.info("Request started", { path: "/swaps", userId });
log.error("Deal failed", err, { dealId, partyId });
```

Output is JSON for easy parsing (e.g. Loki, CloudWatch).

## OpenTelemetry Hooks

Stubs for tracing. Wire `@opentelemetry/api` when ready:

```ts
import { registerTracer, withSpan } from "@canton-mvp/observability";

registerTracer(realTracer);

await withSpan("swap.acceptQuote", async (span) => {
  span.setAttribute("dealId", dealId);
  // ...
});
```

## Prometheus Metrics

Stubs in `@canton-mvp/observability`. Wire `prom-client`:

```ts
import { registerMetrics, getMetrics, METRICS } from "@canton-mvp/observability";

const registry = new Registry();
registerMetrics({
  counter: (name, help, labels) => new Counter({ name, help, labelNames: labels, registries: [registry] }),
  gauge: (name, help, labels) => new Gauge({ name, help, labelNames: labels, registries: [registry] }),
  histogram: (name, help, labels, buckets) => new Histogram({ name, help, labelNames: labels, buckets, registries: [registry] }),
});

// Expose /metrics
app.get("/metrics", async (_, reply) => {
  reply.header("Content-Type", registry.contentType);
  reply.send(await registry.metrics());
});
```

### Pre-defined metric names

- `canton_http_requests_total`
- `canton_http_request_duration_seconds`
- `canton_swap_deals_total`
- `canton_swap_quote_requests_total`
- `canton_wallet_connections_total`
- `canton_ledger_commands_total`
- `canton_errors_total`

## Ops Store

In-memory ring buffers for:

- **Recent errors** – recorded by API error handler
- **Command submissions** – wallet connect/disconnect, swap operations

Exposed via `/api/v1/admin/ops/errors` and `/api/v1/admin/ops/commands` (admin only).

## Grafana / Prometheus

See `infra/README.md` and `docs/local-ops.md` for running the observability stack.
