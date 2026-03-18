import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScanClient } from "../client.js";
import { normalizeScansResponse } from "../normalize.js";

const MOCK_BASE = "http://scan.test";

describe("ScanClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getScans", () => {
    it("returns normalized ScanList", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve([
              { scan_id: "s1", url: "http://scan.example", synchronizer_id: "sync-1" },
            ]),
        })
      );

      const client = new ScanClient({ baseUrl: MOCK_BASE });
      const result = await client.getScans();

      expect(result.scans).toHaveLength(1);
      expect(result.scans[0]?.scanId).toBe("s1");
      expect(result.scans[0]?.url).toBe("http://scan.example");
      expect(result.scans[0]?.synchronizerId).toBe("sync-1");
    });

    it("includes auth header when authToken provided", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
      );

      const client = new ScanClient({ baseUrl: MOCK_BASE, authToken: "token" });
      await client.getScans();

      const headers = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe("Bearer token");
    });
  });

  describe("getTransferRegistryInfo", () => {
    it("returns transfer factory URL", () => {
      const client = new ScanClient({ baseUrl: "http://scan.test" });
      const info = client.getTransferRegistryInfo();
      expect(info.transferFactoryUrl).toBe(
        "http://scan.test/registry/transfer-instruction/v1/transfer-factory"
      );
    });
  });

  describe("fromConfig", () => {
    it("creates client from CantonConfig", () => {
      const client = ScanClient.fromConfig(
        { ledgerApiUrl: "http://ledger:2975", scanApiUrl: "http://scan:4000" },
        "token"
      );
      expect(client).toBeInstanceOf(ScanClient);
    });
  });
});

describe("normalizeScansResponse", () => {
  it("handles array response", () => {
    const raw = [{ scan_id: "a", url: "u" }];
    const result = normalizeScansResponse(raw);
    expect(result.scans).toHaveLength(1);
    expect(result.scans[0]?.scanId).toBe("a");
  });

  it("handles object with scans property", () => {
    const raw = { scans: [{ scan_id: "b" }] };
    const result = normalizeScansResponse(raw);
    expect(result.scans).toHaveLength(1);
    expect(result.scans[0]?.scanId).toBe("b");
  });

  it("handles empty array", () => {
    const result = normalizeScansResponse([]);
    expect(result.scans).toEqual([]);
  });
});
