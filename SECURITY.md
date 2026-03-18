# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x  | :white_check_mark: |

## Reporting a Vulnerability

Please report security vulnerabilities privately. Do not open public issues for security-sensitive findings.

**How to report**:
- Email the maintainers (see repository contacts)
- Include: description, steps to reproduce, impact, suggested fix (if any)
- Allow reasonable time for a fix before public disclosure

**What to expect**:
- Acknowledgment within 48 hours
- Assessment and response plan
- Fix and release when applicable

## Security Documentation

- [Security Model](docs/security-model.md) — Auth, roles, trust boundaries
- [Key Management Boundaries](docs/key-management-boundaries.md) — Where keys live
- [Deployment Trust Boundaries](docs/deployment-trust-boundaries.md) — Network and mTLS
- [Production Hardening Checklist](docs/production-hardening-checklist.md) — Operator checklist

## Local Development vs Production

This project distinguishes **local dev shortcuts** from **production requirements**:

| Area | Local Dev | Production |
|------|-----------|------------|
| Auth | Bearer = userId (no JWT) | JWT verification required |
| Admin seed | `SEED_ADMIN_EXTERNAL_ID` allowed | Must be removed |
| Rate limiting | Off | Required |
| CORS | Permissive | Restrict origins |
| Secrets | .env file | Secrets manager |

See `docs/security-model.md` and `docs/production-hardening-checklist.md` for details.
