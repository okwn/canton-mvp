# Release Process

How to cut a release of Canton MVP.

## First-release checklist

Use this before publishing or announcing the starter as forkable. See also [docs/first-release-checklist.md](docs/first-release-checklist.md).

### Code & quality

- [x] `pnpm build` passes
- [x] `pnpm test` passes
- [x] `pnpm lint` passes
- [ ] No `TODO` or `FIXME` in critical paths (or documented)
- [ ] README reflects current structure and commands

### Documentation

- [ ] README has quick start, package map, extension guide
- [ ] ARCHITECTURE.md exists and is accurate
- [ ] CONTRIBUTING.md describes workflow
- [ ] SECURITY.md has reporting instructions
- [ ] docs/ covers: API design, security, testing, examples
- [ ] .env.example files present for api and web

### Security

- [ ] No secrets in repo
- [ ] docs/security-model.md and production-hardening-checklist.md reviewed
- [ ] SEED_ADMIN_EXTERNAL_ID documented as dev-only

### Examples & integrations

- [ ] examples/ run against API
- [ ] docs/examples-index.md accurate
- [ ] integrations/api-client (if used) documented

### CI

- [ ] GitHub Actions (or equivalent) runs build, lint, test
- [ ] CI passes on main branch

### Optional

- [ ] CHANGELOG.md or release notes
- [ ] Version tags (e.g. v0.1.0)
- [ ] Docker image for API (if applicable)

## Versioning

Use [Semantic Versioning](https://semver.org/):

- **MAJOR** — Breaking API or package changes
- **MINOR** — New features, backward compatible
- **PATCH** — Bug fixes, docs, non-breaking changes

## Tagging

```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

## Post-release

- Update ROADMAP.md if priorities shift
- Announce in appropriate channels (if public)
- Monitor issues and security reports
