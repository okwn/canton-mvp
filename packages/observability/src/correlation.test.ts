import { describe, it, expect } from "vitest";
import {
  createCorrelationId,
  getOrCreateCorrelationId,
  CORRELATION_HEADER,
} from "./correlation.js";

describe("correlation", () => {
  it("CORRELATION_HEADER is x-correlation-id", () => {
    expect(CORRELATION_HEADER).toBe("x-correlation-id");
  });

  it("createCorrelationId returns UUID format", () => {
    const id = createCorrelationId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("getOrCreateCorrelationId returns existing from header", () => {
    const existing = "my-trace-123";
    const id = getOrCreateCorrelationId({ [CORRELATION_HEADER]: existing });
    expect(id).toBe(existing);
  });

  it("getOrCreateCorrelationId falls back to x-request-id", () => {
    const existing = "req-456";
    const id = getOrCreateCorrelationId({ "x-request-id": existing });
    expect(id).toBe(existing);
  });

  it("getOrCreateCorrelationId creates new when missing", () => {
    const id = getOrCreateCorrelationId({});
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });
});
