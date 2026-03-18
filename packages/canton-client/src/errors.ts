/**
 * Canton client error model.
 * Maps JSON Ledger API errors to structured, typed errors.
 */

/** Canton API error payload (JsCantonError). */
export interface CantonErrorPayload {
  code: string;
  cause: string;
  context?: Record<string, string>;
  errorCategory?: number;
  correlationId?: string;
  traceId?: string;
  retryInfo?: string;
  definiteAnswer?: boolean;
}

/** Base error for canton-client. */
export class CantonClientError extends Error {
  override readonly name: string = "CantonClientError";
  readonly code: string;
  override readonly cause: string;
  readonly context?: Record<string, string>;
  readonly statusCode?: number;
  readonly retryable: boolean;

  constructor(
    message: string,
    options: {
      code?: string;
      cause?: string;
      context?: Record<string, string>;
      statusCode?: number;
      retryable?: boolean;
      originalError?: Error;
    } = {}
  ) {
    super(message);
    this.code = options.code ?? "UNKNOWN";
    this.cause = options.cause ?? message;
    if (options.context !== undefined) this.context = options.context;
    if (options.statusCode !== undefined) this.statusCode = options.statusCode;
    this.retryable = options.retryable ?? false;
    Object.setPrototypeOf(this, CantonClientError.prototype);
  }

  static fromPayload(payload: CantonErrorPayload, statusCode?: number): CantonClientError {
    const retryable = payload.definiteAnswer === false || statusCode === 429 || statusCode === 503;
    const opts: { code: string; cause: string; retryable: boolean; context?: Record<string, string>; statusCode?: number } = {
      code: payload.code,
      cause: payload.cause,
      retryable,
    };
    if (payload.context !== undefined) opts.context = payload.context;
    if (statusCode !== undefined) opts.statusCode = statusCode;
    return new CantonClientError(payload.cause ?? payload.code, opts);
  }

  static fromResponse(statusCode: number, body: string): CantonClientError {
    try {
      const payload = JSON.parse(body) as CantonErrorPayload;
      return CantonClientError.fromPayload(payload, statusCode);
    } catch {
      return new CantonClientError(`Request failed: ${statusCode} ${body}`, {
        code: "HTTP_ERROR",
        cause: body,
        statusCode,
        retryable: statusCode === 429 || statusCode === 503,
      });
    }
  }
}

/** Timeout error. */
export class CantonTimeoutError extends CantonClientError {
  override readonly name = "CantonTimeoutError";

  constructor(message = "Request timed out") {
    super(message, { code: "TIMEOUT", retryable: true });
    Object.setPrototypeOf(this, CantonTimeoutError.prototype);
  }
}

/** Network/connection error. */
export class CantonNetworkError extends CantonClientError {
  override readonly name = "CantonNetworkError";

  constructor(message: string, _originalError?: Error) {
    super(message, { code: "NETWORK_ERROR", retryable: true });
    Object.setPrototypeOf(this, CantonNetworkError.prototype);
  }
}
