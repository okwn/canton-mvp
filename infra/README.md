# Canton MVP Infrastructure

## Observability stack

Prometheus and Grafana for metrics and dashboards.

```bash
docker compose -f infra/docker-compose.observability.yml up -d
```

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

The API must expose a `/metrics` endpoint (Prometheus format) for scraping. The `@canton-mvp/observability` package provides metrics stubs; wire `prom-client` and `registerMetrics()` to enable real metrics.
