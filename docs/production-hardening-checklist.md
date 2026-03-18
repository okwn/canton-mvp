# Production Hardening Checklist

Operator responsibilities before deploying Canton MVP to production.

## Auth

- [ ] Set `AUTH_JWT_SECRET` (min 32 chars) from secrets manager
- [ ] Set `AUTH_BEARER_ENABLED=true`
- [ ] Remove or unset `SEED_ADMIN_EXTERNAL_ID`
- [ ] Ensure JWT issuer uses same secret (or configure JWKS if switching to RS256)

## Environment

- [ ] Set `NODE_ENV=production`
- [ ] Never commit `.env` or `.env.production` to version control
- [ ] Inject secrets at runtime (e.g. Kubernetes secrets, Vault)

## Network

- [ ] Terminate TLS at load balancer or API
- [ ] Restrict CORS to known frontend origins (TODO: add CORS_ORIGINS env)
- [ ] Enable rate limiting: `RATE_LIMIT_MAX`, `RATE_LIMIT_TIME_WINDOW_MS`

## Canton Connectivity

- [ ] Use HTTPS for `LEDGER_API_URL`, `VALIDATOR_API_URL`, `SCAN_API_URL`
- [ ] If Canton requires mTLS: provision client cert/key, set `MTLS_*` paths
- [ ] Verify certificate chains; do not disable TLS verification

## Persistence

- [ ] Replace `InMemoryPartyIdentityStore` with persistent store (SQL, etc.)
- [ ] Replace `InMemorySwapEngineStore` with persistent store
- [ ] Replace `OpsStore` in-memory buffers with persistent log (optional)

## Logging

- [ ] Ensure `LOG_LEVEL` is `info` or `warn` in production (avoid `trace`/`debug`)
- [ ] Verify no secrets in logs (observability package redacts known keys)
- [ ] Ship logs to SIEM or log aggregator

## Monitoring

- [ ] Expose `/metrics` (Prometheus) when wired; see `@canton-mvp/observability`
- [ ] Alert on `/health` and `/health/ready` failures
- [ ] Alert on high error rate (ops dashboard or metrics)

## What Remains Operator Responsibility

- Key rotation (AUTH_JWT_SECRET, mTLS certs)
- Backup and restore of persistent stores
- Canton participant onboarding and key management
- Wallet gateway configuration (if using external gateway)
- DDoS protection (beyond rate limiting)
- Security patches for dependencies
