# Contributing

How to contribute to Canton MVP.

## Development setup

```bash
pnpm install
pnpm build
pnpm dev:api   # Terminal 1
pnpm dev:web   # Terminal 2
```

## Workflow

1. **Fork** the repository
2. **Branch** from `main` (or `develop` if used)
3. **Commit** with [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, etc.
4. **Push** and open a pull request

## Code standards

- **TypeScript** — Strict mode, no `any`
- **Lint** — `pnpm lint` must pass
- **Format** — Prettier; run `pnpm format` before commit
- **Tests** — Add or update tests for new behavior

## Commit messages

Use Conventional Commits. Examples:

```
feat(swap-engine): add expiry transition
fix(api): correct party allocation validation
docs: update quick start
```

## Pull requests

- Keep PRs focused; one feature or fix per PR
- Ensure `pnpm build` and `pnpm test` pass
- Update docs if behavior or API changes

## Package changes

- New packages: add to `pnpm-workspace.yaml` if under `apps/`, `packages/`, `examples/`, or `integrations/`
- Dependencies: prefer workspace packages over external when applicable
- Exports: keep public API minimal; internal modules can stay unexported

## Security

Report vulnerabilities privately. See [SECURITY.md](SECURITY.md).
