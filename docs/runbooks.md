# Runbooks

Operational procedures for Canton MVP.

## Service health degraded

**Symptoms**: `/health` or `/health/ready` returns non-200, or `/api/v1/admin/ops/health` shows failing services.

**Checks**:
1. API process running and bound to expected port
2. Identity store and swap engine initialized (in-memory: restart clears state)
3. Validator / ledger URLs configured if using real Canton

**Actions**:
- Restart API: `pnpm dev:api` or `node dist/index.js`
- If validator unreachable: check `VALIDATOR_API_URL`, network, firewall

---

## High error rate

**Symptoms**: Ops dashboard shows many recent errors; `canton_errors_total` increasing.

**Checks**:
1. View `/api/v1/admin/ops/errors` (admin token required)
2. Group by `correlationId` to trace a single request flow
3. Check `message` and `context` for path, method, dealId

**Actions**:
- Fix underlying bug; errors are recorded with correlation ID for debugging
- If auth-related: verify Bearer token format, admin role for ops endpoints

---

## Swap stuck in non-terminal state

**Symptoms**: Deal in `approvals_pending`, `pre_settlement`, or `settlement_ready` with no progress.

**Checks**:
1. Ops dashboard → Swap flow states: inspect deal state
2. Deal detail page: EventTimeline for approvals and checks
3. Ledger connectivity if settlement is submitted

**Actions**:
- Cancel via API: `PATCH /api/v1/swaps/deals/:dealId` with `{ state: "cancelled" }` (if supported)
- Or use `cancelDeal` from swap engine
- Check pre-settlement checks and leg approvals for blockers

---

## Wallet adapter disconnected

**Symptoms**: Ops health shows `wallet.connected: false`; wallet page shows "Not connected".

**Checks**:
1. Mock adapter: always connects on `/wallet/connect`; session may have been cleared
2. Real adapter: check wallet gateway URL, CORS, user session

**Actions**:
- Call `POST /api/v1/wallet/connect` with auth header
- Verify `WALLET_GATEWAY_URL` if using real wallet

---

## Party onboarding audit

**Symptoms**: Need to verify who onboarded which party and when.

**Checks**:
1. Ops dashboard → Party onboarding audit trail
2. Or `GET /api/v1/admin/ops/parties`

**Actions**:
- Export for compliance; filter by `source` (validator, wallet, manual)
- Correlate with user IDs for access control review

---

## Prometheus / Grafana down

**Symptoms**: Cannot reach Prometheus (9090) or Grafana (3001).

**Actions**:
```bash
docker compose -f infra/docker-compose.observability.yml up -d
docker compose -f infra/docker-compose.observability.yml ps
```

Check API exposes `/metrics` if Prometheus shows no data for `canton-mvp-api`.
