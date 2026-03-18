# Deployment Trust Boundaries

Trust boundaries for Canton MVP in production.

## Network Boundaries

```
                    ┌──────────────────┐
                    │   Load Balancer  │
                    │   (TLS term)     │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   API (Canton    │
                    │   MVP)           │
                    │   - Auth         │
                    │   - Rate limit   │
                    │   - CORS         │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   Canton       │  │   Wallet       │  │   Identity     │
│   Validator/   │  │   Gateway      │  │   Provider     │
│   Ledger       │  │   (if external)│  │   (OIDC etc)   │
│   mTLS         │  │   TLS          │  │   TLS          │
└────────────────┘  └────────────────┘  └────────────────┘
```

## Trust Assumptions

| Component | Trust |
|-----------|-------|
| Load balancer | Terminates TLS; forwards to API; may add `X-Forwarded-*` |
| API | Trusts validated Bearer token; trusts Canton when mTLS succeeds |
| Canton | Trusts API identity (mTLS client cert); trusts participant keys |
| Wallet gateway | Trusts API origin (CORS); user trusts wallet UX |
| Identity provider | Issues JWTs; API trusts signature with AUTH_JWT_SECRET / JWKS |

## mTLS-Ready Configuration

When Canton requires client certificates:

```
MTLS_CLIENT_CERT_PATH=/secrets/canton/client.pem
MTLS_CLIENT_KEY_PATH=/secrets/canton/client-key.pem
MTLS_CA_PATH=/secrets/canton/ca.pem
```

- Operator mounts certs into container/VM.
- File permissions: 600 for key, 644 for cert/CA.
- Canton clients (validator-client, canton-client) use these when configured.

**TODO(production)**: Wire mTLS options into validator-client and canton-client constructors.

## CORS

- **Development**: `origin: true` (allow all).
- **Production**: Restrict to known frontend origins. Operator sets `CORS_ORIGINS` (future env).

## Rate Limiting

- Applied at API edge when `RATE_LIMIT_MAX` and `RATE_LIMIT_TIME_WINDOW_MS` are set.
- Keyed by client IP (or `X-Forwarded-For` when behind proxy).
- Returns 429 when exceeded.

## Operator Checklist

See `docs/production-hardening-checklist.md`.
