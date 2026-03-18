# Security Model

Auth, trust boundaries, and hardening for Canton MVP.

## Auth Strategy

| Mode | Condition | Behavior |
|------|-----------|----------|
| **JWT** | `AUTH_JWT_SECRET` set | Verify HS256 JWT; extract `sub` as userId |
| **Dev** | `AUTH_JWT_SECRET` unset | Bearer token = userId (no verification) |

**Production**: Set `AUTH_JWT_SECRET` (min 32 chars). Use a secrets manager.

**Local dev**: Leave unset for opaque-token flow. Never use in production.

## Role / Permission Model

| Role | Capabilities |
|------|--------------|
| `user` | Own data (users, parties, wallet, tokens, swaps) |
| `custodian` | User + custodial operations (TBD) |
| `admin` | All + admin routes (health, ops, user inspection) |

Permissions are resolved via `PartyIdentityService.inspectPermissions(userId)`. Role comes from the AppUser record; JWT `role` claim is optional and may be overridden by DB.

## Trust Boundaries

1. **Client → API**: Authenticated via Bearer. API validates token (JWT or dev opaque).
2. **API → Canton (Validator/Ledger)**: TLS; mTLS when client certs required.
3. **API → Wallet adapter**: In-process; external wallet gateway uses TLS.
4. **Signing provider**: Wallet holds keys; API never sees private keys. See `docs/key-management-boundaries.md`.

## Secrets Handling

- **AUTH_JWT_SECRET**: Required in production. Store in secrets manager; never in .env committed to repo.
- **mTLS certs**: Operator provisions; paths via env. Files must have restricted permissions.
- **Canton API keys**: If Validator requires auth, use env or secrets manager.

See `docs/key-management-boundaries.md` for key lifecycle.

## Environment Separation

| Env | JWT | Rate limit | SEED_ADMIN | CORS |
|-----|-----|------------|------------|------|
| development | Optional | Off | Allowed | Permissive |
| test | Optional | Off | Allowed | Permissive |
| production | Required | Required | Forbidden | Restrict origins |

Operator must set `NODE_ENV=production` and remove `SEED_ADMIN_EXTERNAL_ID`.

## Secure Logging

`@canton-mvp/observability` redacts: `password`, `secret`, `token`, `authorization`, `cookie`, `apiKey`, `credential`, `jwt`, and keys containing `secret` or `password`.

Never log raw tokens, keys, or credentials.
