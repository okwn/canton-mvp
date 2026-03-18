import { describe, it, expect, vi, afterEach } from "vitest";
import { createMockLedgerFetch } from "./MockLedgerTransport.js";

describe("createMockLedgerFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns version for /v2/version", async () => {
    const mockFetch = createMockLedgerFetch();
    vi.stubGlobal("fetch", mockFetch);

    const res = await fetch("http://ledger.test/v2/version");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { major?: string; minor?: string };
    expect(body.major).toBe("2");
    expect(body.minor).toBe("0");
  });

  it("returns completions for submit-and-wait", async () => {
    const mockFetch = createMockLedgerFetch();
    vi.stubGlobal("fetch", mockFetch);

    const res = await fetch("http://ledger.test/v2/commands/submit-and-wait", {
      method: "POST",
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { completions: Array<{ status?: { status: string } }> };
    expect(body.completions).toHaveLength(1);
    expect(body.completions[0]?.status?.status).toBe("OK");
  });
});
