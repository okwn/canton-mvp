# Security Boundaries

> Auth, trust, and boundary documentation for the Canton MVP API.
>
> See also: [Security Model](security-model.md), [Key Management](key-management-boundaries.md), [Deployment Trust](deployment-trust-boundaries.md), [Production Checklist](production-hardening-checklist.md).

## Identity Boundaries

| Boundary | App Side | Ledger Side |
|----------|----------|-------------|
| **App user** | AppUser (id, email, role) | — |
| **Ledger party** | CantonParty (partyId, userId) | Party on Canton |
| **Wallet** | WalletIdentity (providerId, partyId) | External wallet session |

- **Auth** (Bearer, JWT, OIDC) is **app-side**.
- **Ledger identity** (party) is **ledger-side**.
- The mapping (AppUser ↔ CantonParty) is stored in party-identity.

## Trust Model

1. **API → packages**: The API trusts its internal packages (party-identity, swap-engine, etc.). No external input is passed unvalidated to ledger clients.

2. **API → Validator**: When `VALIDATOR_API_URL` is set, the API calls the Validator for metadata. The Validator is a trusted Canton component. Use TLS and validate certificates in production.

3. **API → Wallet**: The wallet adapter (MockWalletAdapter in dev) provides session and holdings. In production, use DappSdkAdapter or WalletSdkAdapter with proper gateway/validator URLs.

4. **Client → API**: Clients authenticate via Bearer token. In production, use JWT with signature verification. The current mock uses `userId` as the token for development only.

## Auth Middleware

- **authMiddleware**: Requires `Authorization: Bearer <token>`. Sets `req.userId = token`. Returns 401 if missing.
- **optionalAuthMiddleware**: Extracts Bearer if present; does not fail if missing.

## Admin Access

Admin routes check `inspectPermissions(userId).isAdmin`. Only users with `role: "admin"` can access:

- `GET /api/v1/admin/health/detailed`
- `GET /api/v1/admin/users/:userId/parties`

## Data Isolation

- **Per-user**: Users, parties, and wallet linkages are keyed by `userId`. A user can only access their own data unless they are admin.
- **In-memory store**: The default `InMemoryPartyIdentityStore` and `InMemorySwapEngineStore` do not persist across restarts. Use a persistent store (SQL, etc.) in production.

## Recommendations for Production

1. **Replace mock auth** with JWT or OIDC. Verify signatures and expiry.
2. **Use HTTPS** for all API traffic.
3. **Validate Validator/Scan URLs** and use TLS.
4. **Rate limit** public endpoints.
5. **Audit log** sensitive operations (user creation, party allocation, deal acceptance).
6. **Secrets**: Store `AUTH_JWT_SECRET` and similar in a secrets manager, not in env files.
