# Stubs, Mocks, and Production Boundaries

This document clearly labels what is mock, dev-only, or not yet production-wired. Use it when forking or extending Canton MVP.

## Mock Implementations

| Component | Location | Purpose |
|-----------|----------|---------|
| **MockWalletAdapter** | `packages/wallet-adapter` | Simulates wallet connect, session, signing. No real keys. |
| **InMemoryPartyIdentityStore** | `packages/party-identity` | User/party storage in memory. Lost on restart. |
| **InMemorySwapEngineStore** | `packages/swap-engine` | Quote/deal storage in memory. Lost on restart. |
| **createDevTokenValidator** | `apps/api` | Treats Bearer token as userId. No verification. |
| **Metrics stubs** | `packages/observability` | No-op counters/gauges. Wire to prom-client for real metrics. |

## Dev-Only Shortcuts

| Item | Notes |
|------|-------|
| **SEED_ADMIN_EXTERNAL_ID** | When set, that externalId gets admin role. Remove in production; use IdP. |
| **Auth login returns userId as token** | In dev (no AUTH_JWT_SECRET), Bearer token = userId. Use JWT in production. |
| **CORS `origin: true`** | When CORS_ORIGINS is unset, allows all origins. Set CORS_ORIGINS in production. |
| **No rate limiting by default** | Set RATE_LIMIT_MAX and RATE_LIMIT_TIME_WINDOW_MS for production. |

## Not Yet Production-Wired

| Area | Status |
|------|--------|
| **Ledger submission** | Swap settlement creates instruction; canton-client submit not wired. |
| **Real wallet adapters** | DappSdkAdapter / WalletSdkAdapter exist but are stubbed; use MockWalletAdapter for dev. |
| **JWT issuance** | JWT validation exists; issuance/OIDC flow incomplete. |
| **mTLS** | Config (MTLS_CLIENT_CERT_PATH etc.) exists; not wired into validator/canton clients. |
| **Persistent stores** | All stores are in-memory. Implement ISwapEngineStore, IPartyIdentityStore with SQL/event store. |
| **Prometheus metrics** | `/metrics` returns minimal JSON. Wire to prom-client for full metrics. |

## Production Checklist

See [production-hardening-checklist.md](./production-hardening-checklist.md) for the full list.
