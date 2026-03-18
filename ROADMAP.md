# Roadmap

Planned work and priorities for Canton MVP.

## Current focus

- [x] API with auth, parties, wallet, tokens, swaps
- [x] Web reference frontend (Next.js)
- [x] Swap engine (quote → deal → settlement prep)
- [x] Mock wallet, mock stores
- [x] Examples (wallet, swap flow, onboarding)
- [x] Security docs, hardening checklist
- [x] Testing (unit, integration, E2E)
- [x] CI workflow

## Near term

- [ ] Ledger submission wiring (canton-client submit from swap-engine)
- [ ] Persistent stores (SQL adapter for swap-engine, party-identity)
- [ ] Real wallet adapter (DappSdkAdapter or WalletSdkAdapter)
- [ ] JWT issuance (or OIDC integration guide)
- [x] CORS_ORIGINS env for production (enforced when set)

## Medium term

- [ ] Daml contract deployment guide
- [ ] Canton LocalNet / DevNet setup scripts
- [ ] Browser E2E (Playwright)
- [ ] Prometheus metrics wiring
- [ ] OpenTelemetry tracing

## Long term

- [ ] Multi-party swaps (beyond bilateral)
- [ ] Custodial / delegation patterns
- [ ] Compliance hooks (AML, sanctions)
- [ ] Plugin architecture for custom flows

## Out of scope (for now)

- Full DeFi protocol (AMMs, lending)
- Mobile-native apps
- Key management (HSM, KMS) — operator responsibility
