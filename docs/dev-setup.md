# Dev Setup

Developer setup guide for Canton MVP.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 20 | LTS recommended |
| pnpm | ≥ 9 | `corepack enable && corepack prepare pnpm@latest` |
| Daml SDK | 3.x | Required for `packages/daml-models`; [daml.com](https://www.daml.com) |
| Docker | Latest | For LocalNet (optional) |

---

## One-time setup

```bash
# Clone and enter repo
cd canton-mvp

# Install dependencies
pnpm install

# Build all packages
pnpm build

# (Optional) Install Daml SDK for daml-models
# daml install
# cd packages/daml-models && pnpm run build:daml && pnpm run build:codegen
```

---

## Environment

Copy `.env.example` to `.env` and adjust:

```bash
cp .env.example .env
```

Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `LEDGER_API_URL` | `http://canton.localhost:2975` | JSON Ledger API base URL |
| `VALIDATOR_API_URL` | `http://canton.localhost:2903` | Validator API base URL |
| `SCAN_API_URL` | `http://scan.localhost:4000` | Scan API base URL |
| `PORT` | `8080` | API server port |
| `AUTH_MODE` | `shared-secret` | `shared-secret` or `oauth2` |

App-specific `.env.example` files exist in `apps/web` and `apps/api`.

---

## Development workflow

### Start all apps

```bash
pnpm dev
# or
make dev
```

### Start individual apps

```bash
pnpm dev:web     # Web app @ http://localhost:3000
pnpm dev:api     # API @ http://localhost:8080
pnpm dev:admin   # Admin @ http://localhost:3001
pnpm dev:docs    # Docs site
```

### Lint and format

```bash
pnpm lint        # Lint all
pnpm lint:fix    # Lint + fix
pnpm format      # Prettier
pnpm format:check  # Check only
```

### Tests

```bash
pnpm test
pnpm test:coverage
```

### Build

```bash
pnpm build
# Filter: pnpm build:filter @canton-mvp/web
```

---

## Docker-friendly conventions

- **Ports**: Web 3000, API 8080, Admin 3001, Docs (VitePress default)
- **Env**: All config via env vars; no hardcoded URLs in code
- **Health**: API exposes `/health` for readiness
- **LocalNet**: Use `make docker-up` (customize with your compose file)

---

## IDE

### VS Code

Recommended extensions:

- ESLint
- Prettier
- TypeScript

Settings (optional):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

---

## Windows

- Use `pnpm` directly instead of `make` (or install Make via Chocolatey)
- See `Makefile.win` for equivalent commands
- For `rm -rf` in package scripts, use Git Bash or WSL

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `pnpm install` fails | Ensure Node ≥ 20, pnpm ≥ 9 (`corepack enable && corepack prepare pnpm@latest`) |
| `daml build` not found | Install Daml SDK; daml-models builds without it (TypeScript only) |
| Port in use | Change `PORT` or app port in vite.config |
| Turbo cache issues | `pnpm turbo run build --force` |
