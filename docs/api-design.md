# API Design

> Canton MVP API design and architecture.

## Overview

The Canton MVP API is a modular Fastify service that exposes onboarding, wallet, tokens, swaps, network, and admin capabilities. It integrates with `@canton-mvp/party-identity`, `@canton-mvp/wallet-adapter`, `@canton-mvp/token-standard`, `@canton-mvp/swap-engine`, and `@canton-mvp/validator-client`.

## Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js, TypeScript |
| Framework | Fastify 5 |
| Validation | Zod |
| Docs | OpenAPI (Swagger) |
| Logging | Pino (Fastify default) |

## Base URL

All API routes are prefixed with `/api/v1`.

## Authentication

- **Bearer token**: `Authorization: Bearer <userId>` (mock for development)
- **Auth middleware**: Extracts `userId` from Bearer; returns 401 if missing on protected routes
- **Optional auth**: Some routes (e.g. network metadata) work with or without auth

In production, replace the mock with JWT or OIDC.

## Health Endpoints

| Path | Description |
|------|-------------|
| `GET /health` | Liveness |
| `GET /health/ready` | Readiness |
| `GET /api/v1/admin/health/detailed` | Detailed health (admin only) |

## OpenAPI

- **Swagger UI**: `GET /docs` (interactive API documentation)
- **Export spec**: `pnpm openapi:export` writes `openapi.json`

## Environment

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | development \| test \| production | development | Environment |
| `PORT` | number | 8080 | Server port |
| `LOG_LEVEL` | trace \| debug \| info \| warn \| error | info | Log level |
| `LEDGER_API_URL` | string | - | Canton Ledger API URL |
| `VALIDATOR_API_URL` | string | - | Canton Validator API URL |
| `SCAN_API_URL` | string | - | Canton Scan API URL |
| `AUTH_JWT_SECRET` | string | - | JWT secret (future) |
| `AUTH_BEARER_ENABLED` | boolean | true | Enable Bearer auth |

## Error Handling

- `400` Bad Request: Validation failure
- `401` Unauthorized: Missing or invalid auth
- `403` Forbidden: Insufficient permissions
- `404` Not Found: Resource not found
- `502` Bad Gateway: Upstream (e.g. validator) unavailable

Errors return `{ error: string, details?: string }`.

## Structured Logging

All requests are logged by Fastify. Use `req.log` in handlers. Log format is JSON (Pino).
