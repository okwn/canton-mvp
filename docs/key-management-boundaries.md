# Key Management Boundaries

Where keys live and who is responsible.

## Boundary Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser/App)                      │
│  - Session token (JWT or opaque)                                 │
│  - Wallet extension (if DappSdk)                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API (Canton MVP)                          │
│  - AUTH_JWT_SECRET (verify only; never signs in MVP)             │
│  - mTLS client cert/key (when Canton requires)                  │
│  - NO ledger signing keys                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ TLS / mTLS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Canton (Validator / Ledger)                    │
│  - Validator identity                                             │
│  - Participant keys (operator-managed)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Signing Provider (Wallet)                      │
│  - User keys for transaction signing                             │
│  - NEVER exposed to API                                          │
└─────────────────────────────────────────────────────────────────┘
```

## API Responsibilities

- **JWT verification**: Uses `AUTH_JWT_SECRET` to verify tokens. Does not issue JWTs in MVP (issuer is external IdP or custom service).
- **mTLS**: When `MTLS_CLIENT_CERT_PATH`, `MTLS_CLIENT_KEY_PATH` are set, Canton clients use them for outbound connections.
- **No ledger keys**: API never holds participant private keys. Signing is delegated to the wallet/signing provider.

## Signing Provider Boundary

The **wallet adapter** (MockWalletAdapter, DappSdkAdapter, WalletSdkAdapter) is the signing boundary:

- User connects wallet → session established.
- API calls `prepareTransaction` / `requestSigning` → wallet shows UX, user signs.
- Signed payload returns to API or submits directly to ledger (adapter-dependent).

**Rule**: API must never receive or log private keys or raw signing material.

## Operator Responsibilities

1. **AUTH_JWT_SECRET**: Generate strong secret (32+ chars); rotate periodically; store in secrets manager.
2. **mTLS certs**: Provision client cert/key for Canton; set file permissions (e.g. 600); rotate per Canton policy.
3. **Canton participant keys**: Managed by Canton operator; not in API scope.
4. **Wallet keys**: User-managed via wallet; API has no access.
