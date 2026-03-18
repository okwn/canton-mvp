# Compatibility Matrix — Quickstart Overlay

Version compatibility for running canton-mvp in overlay mode (on top of cn-quickstart LocalNet).

---

## 1. Daml

| Daml SDK | canton-mvp | cn-quickstart | Notes |
|----------|------------|---------------|-------|
| 3.0.x | ✅ | ✅ | Target for canton-mvp |
| 2.9.x | ⚠️ | ✅ | May work; JSON API v2 assumed |
| 2.8.x | ⚠️ | ⚠️ | Older Quickstart; verify JSON API |
| 2.7.x | ❌ | ❌ | Not recommended |

**canton-mvp default**: `packages/daml-models/daml.yaml` uses `sdk-version: "3.0.0"`.

**Quickstart**: Check `cn-quickstart/quickstart/daml/` or Quickstart docs for their SDK version.

---

## 2. Canton

| Canton | JSON Ledger API | canton-mvp | Notes |
|--------|-----------------|-----------|-------|
| 3.x | v2 | ✅ | Primary target |
| 2.x | v1/v2 | ⚠️ | Verify JSON API version |
| 1.x | v1 | ❌ | Not supported |

**Assumption**: canton-mvp uses **JSON Ledger API v2** only. gRPC Ledger API is not used.

**Quickstart**: Uses Canton via Splice LocalNet; version is determined by Splice/Canton images.

---

## 3. Wallet SDK / dApp SDK

| Package | Version | CIP-103 | canton-mvp |
|---------|---------|---------|------------|
| @canton-network/dapp-sdk | Latest | ✅ | Compatible |
| @canton-network/wallet-sdk | Latest | — | For wallet providers |
| splice-wallet-kernel | Main | ✅ | Reference implementation |

**canton-mvp**: `@canton-mvp/wallet-adapter` abstracts CIP-103; implement via dApp SDK or direct RPC.

**Assumption**: CIP-103 dApp API is stable; wallet gateway URL is configurable.

---

## 4. JSON API Assumptions

canton-mvp assumes the following JSON Ledger API v2 behavior:

| Endpoint / behavior | Assumption |
|---------------------|------------|
| `GET /v2/version` | Returns `{ "version": "..." }` |
| `POST /v2/commands/create` | Create contract |
| `POST /v2/commands/exercise` | Exercise choice |
| `POST /v2/query` | Query contracts |
| `GET /v2/ledger/...` | Stream events (if used) |
| Auth | Bearer token in `Authorization` header |

**Breaking changes**: If Canton/Quickstart changes JSON API contract, update `@canton-mvp/canton-client` and this matrix.

---

## 5. cn-quickstart Versions

| Quickstart | Canton | Daml | canton-mvp overlay |
|------------|--------|------|--------------------|
| Latest (main) | 3.x | 3.x | ✅ Tested |
| Pre-Jul 2025 (DevNet) | — | — | ❌ DevNet removed |
| Older (pre-LocalNet) | — | — | ❌ Not supported |

**Note**: As of July 2025, Quickstart uses LocalNet only (no DevNet).

---

## 6. Splice LocalNet

| Splice | Canton | Notes |
|--------|--------|-------|
| Latest | 3.x | From hyperledger-labs/splice |
| decentralized-canton-sync | Release dumps | Use Splice repo directly |

**Quickstart** uses Splice LocalNet from `splice/cluster/compose/localnet`.

---

## 7. Summary

| Component | canton-mvp expects |
|-----------|--------------------|
| Daml | 3.0.x (or compatible 2.9.x) |
| Canton | 3.x with JSON Ledger API v2 |
| Wallet | CIP-103 compatible (dApp SDK / Wallet Gateway) |
| Quickstart | LocalNet-based (post-Jul 2025) |

---

*Last updated: March 2026. Verify against current Quickstart and Splice releases.*
