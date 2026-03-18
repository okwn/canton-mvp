/**
 * @canton-mvp/observability
 *
 * Structured logging, correlation IDs, OpenTelemetry hooks, Prometheus metrics.
 */

export interface LogContext {
  correlationId?: string;
  requestId?: string;
  partyId?: string;
  operation?: string;
  [key: string]: unknown;
}

export function createLogger(service: string) {
  return {
    info(message: string, context?: LogContext): void {
      console.log(
        JSON.stringify({
          level: "info",
          service,
          message,
          timestamp: new Date().toISOString(),
          ...context,
        })
      );
    },
    error(message: string, error?: unknown, context?: LogContext): void {
      console.error(
        JSON.stringify({
          level: "error",
          service,
          message,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          ...context,
        })
      );
    },
    warn(message: string, context?: LogContext): void {
      console.warn(
        JSON.stringify({
          level: "warn",
          service,
          message,
          timestamp: new Date().toISOString(),
          ...context,
        })
      );
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;

export {
  createCorrelationId,
  getOrCreateCorrelationId,
  CORRELATION_HEADER,
} from "./correlation.js";
export {
  createStructuredLogger,
  type StructuredLogger,
  type LoggerContext,
} from "./logger.js";
export {
  registerTracer,
  getTracer,
  withSpan,
  type Tracer,
  type Span,
  type SpanContext,
} from "./otel.js";
export {
  registerMetrics,
  getMetrics,
  METRICS,
  type MetricsRegistry,
  type Counter,
  type Gauge,
  type Histogram,
} from "./metrics.js";
