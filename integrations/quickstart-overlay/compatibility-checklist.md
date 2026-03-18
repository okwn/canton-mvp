# Compatibility Checklist — Quickstart Overlay

Pre-flight checks before running canton-mvp in overlay mode (on top of cn-quickstart LocalNet).

---

## Before First Run

- [ ] **cn-quickstart** is cloned and built separately
- [ ] **Quickstart LocalNet** is running (`make start` in cn-quickstart)
- [ ] **Docker** has sufficient memory (8 GB+ recommended)
- [ ] **Ports** 2975, 2903, 4000 (and others per port-map) are available
- [ ] **`.env`** is configured with Quickstart URLs (see `port-map.json`)

---

## Service Checks

Run `scripts/validate-services.sh` to verify:

- [ ] JSON Ledger API (`/v2/version`) responds
- [ ] Validator API (`/api/validator/v0/validator-user`) responds
- [ ] Scan API (`/api/scan/v0/scans`) responds (if Scan is enabled)

---

## Version Alignment

- [ ] **Daml SDK** in canton-mvp `packages/daml-models` matches Quickstart `daml.yaml` (or is compatible)
- [ ] **Canton** version used by Quickstart is compatible with JSON Ledger API v2
- [ ] **Wallet SDK** / dApp SDK (if used) matches CIP-103 expectations

See `compatibility-matrix.md` for supported combinations.

---

## Auth Mode

- [ ] **shared-secret**: Quickstart started with OAuth2 disabled (`make setup` → shared-secret)
- [ ] **OAuth2**: Keycloak is running; canton-mvp `party-identity` configured for OAuth2

---

## Post-Check

- [ ] `pnpm build` succeeds in canton-mvp
- [ ] `pnpm dev:api` can reach Ledger API
- [ ] `pnpm dev:web` loads (wallet gateway URL correct if using wallet)

---

*Use this checklist when setting up overlay mode or after Quickstart upgrades.*
