# First Release Checklist

Use before publishing or announcing Canton MVP as a forkable starter.

## Code & quality

- [ ] `pnpm build` passes
- [ ] `pnpm test` passes
- [ ] `pnpm lint` passes
- [ ] No unaddressed `TODO` or `FIXME` in critical paths
- [ ] README reflects current structure and commands

## Documentation

- [ ] README: what it is, who it's for, quick start, package map, extension guide
- [ ] ARCHITECTURE.md: package map, dependency graph
- [ ] CONTRIBUTING.md: workflow, commit format
- [ ] SECURITY.md: vulnerability reporting
- [ ] ROADMAP.md: planned work
- [ ] RELEASE.md: release process
- [ ] docs/: API design, security, testing, examples
- [ ] .env.example for api and web

## Security

- [ ] No secrets in repo
- [ ] docs/security-model.md and production-hardening-checklist.md reviewed
- [ ] SEED_ADMIN_EXTERNAL_ID documented as dev-only

## Examples & integrations

- [ ] examples/ run against API
- [ ] docs/examples-index.md accurate
- [ ] integrations/ documented

## CI

- [ ] GitHub Actions runs build, lint, test
- [ ] CI passes on main branch

## Optional

- [ ] CHANGELOG.md
- [ ] Version tag (e.g. v0.1.0)
- [ ] Docker image for API
