# Quickstart Overlay

Optional integration layer for running **canton-mvp** on top of [cn-quickstart](https://github.com/digital-asset/cn-quickstart) LocalNet.

---

## Purpose

- **Not a fork**: We do not copy or embed cn-quickstart.
- **Optional**: canton-mvp works standalone; this overlay is for teams that want Quickstart's full topology.
- **Adapter-based**: Quickstart-specific logic is isolated here; core packages stay agnostic.

---

## When to Use

| Use overlay when… | Use standalone when… |
|-------------------|------------------------|
| You need SV, Scan, Amulet, full Splice LocalNet | You want minimal LocalNet (single participant) |
| You're migrating from Quickstart | You're starting fresh with canton-mvp |
| You need Quickstart's OAuth2/Keycloak setup | You use shared-secret or custom auth |
| You want to validate against Quickstart topology | You run your own Docker/infra |

---

## Quick Start (Overlay Mode)

1. **Clone cn-quickstart** (separately):
   ```bash
   git clone https://github.com/digital-asset/cn-quickstart.git
   cd cn-quickstart/quickstart
   make setup && make build && make start
   ```

2. **Configure canton-mvp** to point at Quickstart:
   ```bash
   cp .env.example .env
   # Set LEDGER_API_URL, VALIDATOR_API_URL, SCAN_API_URL per port-map.json
   ```

3. **Validate** services are up:
   ```bash
   ./integrations/quickstart-overlay/scripts/validate-services.sh
   ```

4. **Run canton-mvp** apps:
   ```bash
   pnpm dev
   ```

---

## Contents

| File | Purpose |
|------|---------|
| `README.md` | This file |
| `sync-strategy.md` | How we track Quickstart changes |
| `compatibility-checklist.md` | Pre-flight checks before overlay mode |
| `compatibility-matrix.md` | Daml, Canton, wallet SDK, JSON API versions |
| `port-map.json` | Port mappings (Quickstart → canton-mvp env) |
| `scripts/bootstrap.sh` | Bootstrap local environment |
| `scripts/map-ports.sh` | Generate env from port map |
| `scripts/validate-services.sh` | Validate required services |

---

## Scripts (Unix / Git Bash / WSL)

Scripts are Bash. On Windows, use Git Bash or WSL:

```bash
# From repo root
make overlay-bootstrap   # Bootstrap env
make overlay-validate   # Validate services
```

Or run directly: `./integrations/quickstart-overlay/scripts/validate-services.sh`

## See Also

- [docs/quickstart-overlay.md](../../docs/quickstart-overlay.md) — Full overlay strategy
- [docs/repo-intelligence.md](../../docs/repo-intelligence.md) — What we borrow from Quickstart
