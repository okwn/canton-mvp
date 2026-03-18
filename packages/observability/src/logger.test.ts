import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createStructuredLogger } from "./logger.js";

describe("createStructuredLogger", () => {
  let logs: string[];

  beforeEach(() => {
    logs = [];
    vi.spyOn(console, "log").mockImplementation((msg) => logs.push(msg));
    vi.spyOn(console, "warn").mockImplementation((msg) => logs.push(msg));
    vi.spyOn(console, "error").mockImplementation((msg) => logs.push(msg));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("outputs JSON with level and message", () => {
    const log = createStructuredLogger("test");
    log.info("hello");
    const parsed = JSON.parse(logs[0]!);
    expect(parsed.level).toBe("info");
    expect(parsed.service).toBe("test");
    expect(parsed.message).toBe("hello");
    expect(parsed.timestamp).toBeDefined();
  });

  it("redacts sensitive keys", () => {
    const log = createStructuredLogger("test");
    log.info("msg", { password: "secret123", userId: "u1" });
    const parsed = JSON.parse(logs[0]!);
    expect(parsed.password).toBe("[REDACTED]");
    expect(parsed.userId).toBe("u1");
  });

  it("redacts token", () => {
    const log = createStructuredLogger("test");
    log.info("msg", { token: "abc", correlationId: "cid" });
    const parsed = JSON.parse(logs[0]!);
    expect(parsed.token).toBe("[REDACTED]");
    expect(parsed.correlationId).toBe("cid");
  });

  it("serializes errors", () => {
    const log = createStructuredLogger("test");
    log.error("failed", new Error("oops"));
    const parsed = JSON.parse(logs[0]!);
    expect(parsed.error).toBe("oops");
  });
});
