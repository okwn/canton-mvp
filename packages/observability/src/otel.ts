/**
 * OpenTelemetry hooks - stubs for tracing.
 * Wire to @opentelemetry/api when ready.
 */

export interface SpanContext {
  traceId: string;
  spanId: string;
  correlationId?: string;
}

export interface Span {
  setAttribute(key: string, value: string | number | boolean): void;
  setStatus(status: { code: number; message?: string }): void;
  end(): void;
}

export interface Tracer {
  startSpan(name: string, attributes?: Record<string, string | number | boolean>): Span;
  getActiveSpan(): Span | undefined;
}

let tracerImpl: Tracer | null = null;

/**
 * Register a tracer implementation (e.g. OpenTelemetry SDK).
 */
export function registerTracer(tracer: Tracer): void {
  tracerImpl = tracer;
}

/**
 * Get the current tracer or a no-op stub.
 */
export function getTracer(): Tracer {
  if (tracerImpl) return tracerImpl;
  return noopTracer;
}

const noopSpan: Span = {
  setAttribute: () => {},
  setStatus: () => {},
  end: () => {},
};

const noopTracer: Tracer = {
  startSpan: () => noopSpan,
  getActiveSpan: () => undefined,
};

/**
 * Run a function within a span.
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const tracer = getTracer();
  const span = tracer.startSpan(name, attributes);
  try {
    const result = await fn(span);
    span.setStatus({ code: 1 }); // OK
    return result;
  } catch (err) {
    span.setStatus({ code: 2, message: err instanceof Error ? err.message : String(err) }); // ERROR
    throw err;
  } finally {
    span.end();
  }
}
