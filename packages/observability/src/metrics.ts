/**
 * Prometheus metrics stubs.
 * Wire to prom-client when ready.
 */

export type MetricType = "counter" | "gauge" | "histogram";

export interface MetricLabels {
  [key: string]: string;
}

export interface Counter {
  inc(labels?: MetricLabels, value?: number): void;
}

export interface Gauge {
  set(value: number, labels?: MetricLabels): void;
  inc(labels?: MetricLabels, value?: number): void;
  dec(labels?: MetricLabels, value?: number): void;
}

export interface Histogram {
  observe(value: number, labels?: MetricLabels): void;
}

export interface MetricsRegistry {
  counter(name: string, help: string, labelNames?: string[]): Counter;
  gauge(name: string, help: string, labelNames?: string[]): Gauge;
  histogram(name: string, help: string, labelNames?: string[], buckets?: number[]): Histogram;
}

const noopCounter: Counter = { inc: () => {} };
const noopGauge: Gauge = { set: () => {}, inc: () => {}, dec: () => {} };
const noopHistogram: Histogram = { observe: () => {} };

let registryImpl: MetricsRegistry | null = null;

/**
 * Register a metrics registry (e.g. prom-client).
 */
export function registerMetrics(registry: MetricsRegistry): void {
  registryImpl = registry;
}

/**
 * Get the current registry or a no-op stub.
 */
export function getMetrics(): MetricsRegistry {
  if (registryImpl) return registryImpl;
  return {
    counter: () => noopCounter,
    gauge: () => noopGauge,
    histogram: () => noopHistogram,
  };
}

/** Pre-defined metric names for Canton MVP. */
export const METRICS = {
  HTTP_REQUESTS_TOTAL: "canton_http_requests_total",
  HTTP_REQUEST_DURATION: "canton_http_request_duration_seconds",
  SWAP_DEALS_TOTAL: "canton_swap_deals_total",
  SWAP_QUOTE_REQUESTS_TOTAL: "canton_swap_quote_requests_total",
  WALLET_CONNECTIONS_TOTAL: "canton_wallet_connections_total",
  LEDGER_COMMANDS_TOTAL: "canton_ledger_commands_total",
  ERRORS_TOTAL: "canton_errors_total",
} as const;
