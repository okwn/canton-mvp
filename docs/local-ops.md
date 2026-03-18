# Local Operations

Running and operating Canton MVP locally.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (optional, for Prometheus/Grafana)

## Start services

```bash
# API
pnpm dev:api

# Web app
pnpm dev:web

# Observability stack (optional)
docker compose -f infra/docker-compose.observability.yml up -d
```

## Admin access

Ops endpoints (`/api/v1/admin/*`) require an authenticated user with `role: "admin"`.

**Create admin user** (first login only):

1. Call `POST /api/v1/auth/login` with `{ "externalId": "admin" }`
2. Use returned `userId` as Bearer token
3. Or set `SEED_ADMIN_EXTERNAL_ID=your-id` and login with that externalId

The web app stores `userId` in localStorage as the token. Sign in with `externalId: "admin"` to get admin access for the Ops dashboard.

## Ops dashboard

1. Sign in at `/connect` (use externalId `admin` for admin)
2. Go to **Ops** in the sidebar (`/admin/ops`)
3. Views:
   - Service health
   - API dependency health
   - Wallet adapter status
   - Swap flow states (deals, quote requests)
   - Recent errors (with correlation IDs)
   - Command submissions
   - Party onboarding audit trail

## Correlation IDs

Every API response includes `x-correlation-id`. Use it to:

- Trace a request across logs
- Find related errors in the Ops errors table
- Debug wallet or swap flows

Example:
```bash
curl -H "Authorization: Bearer admin" -H "x-correlation-id: my-trace-123" \
  http://localhost:8080/api/v1/wallet/connect
```

## Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API port | 8080 |
| `LOG_LEVEL` | trace, debug, info, warn, error | info |
| `VALIDATOR_API_URL` | Canton validator API | — |
| `LEDGER_API_URL` | Canton ledger API | — |
| `SCAN_API_URL` | Canton scan API | — |
| `SEED_ADMIN_EXTERNAL_ID` | ExternalId that gets admin role on first create | — |

## Observability stack

- **Prometheus**: http://localhost:9090 — scrapes API `/metrics` (when implemented)
- **Grafana**: http://localhost:3001 — admin/admin

The API metrics stubs are in `@canton-mvp/observability`. Wire `prom-client` and expose `/metrics` to populate Prometheus.
