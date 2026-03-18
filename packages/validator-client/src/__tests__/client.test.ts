import { describe, it, expect, vi, beforeEach } from "vitest";
import { ValidatorClient } from "../client.js";
import { normalizeValidatorUser, normalizeDsoPartyId } from "../normalize.js";

const MOCK_BASE = "http://validator.test";

describe("ValidatorClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getValidatorUser", () => {
    it("returns normalized ValidatorUserInfo", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              user_id: "u1",
              primary_party: "Alice::123",
              identity_provider_id: "idp1",
            }),
        })
      );

      const client = new ValidatorClient({ baseUrl: MOCK_BASE });
      const result = await client.getValidatorUser();

      expect(result.userId).toBe("u1");
      expect(result.primaryParty).toBe("Alice::123");
      expect(result.identityProviderId).toBe("idp1");
    });

    it("includes auth header when authToken provided", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({}),
        })
      );

      const client = new ValidatorClient({ baseUrl: MOCK_BASE, authToken: "token" });
      await client.getValidatorUser();

      const headers = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe("Bearer token");
    });
  });

  describe("getDsoPartyId", () => {
    it("returns normalized DsoPartyInfo from string response", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve("DSO::1220abc"),
        })
      );

      const client = new ValidatorClient({ baseUrl: MOCK_BASE });
      const result = await client.getDsoPartyId();

      expect(result.dsoPartyId).toBe("DSO::1220abc");
    });

    it("returns normalized DsoPartyInfo from object response", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ dso_party_id: "DSO::1220xyz" }),
        })
      );

      const client = new ValidatorClient({ baseUrl: MOCK_BASE });
      const result = await client.getDsoPartyId();

      expect(result.dsoPartyId).toBe("DSO::1220xyz");
    });
  });

  describe("getValidatorPartyMetadata", () => {
    it("returns validator user and DSO party", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ user_id: "u1", primary_party: "Alice::1" }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve("DSO::1220abc"),
          })
      );

      const client = new ValidatorClient({ baseUrl: MOCK_BASE });
      const result = await client.getValidatorPartyMetadata();

      expect(result.validatorUser.userId).toBe("u1");
      expect(result.dsoParty.dsoPartyId).toBe("DSO::1220abc");
    });
  });

  describe("fromConfig", () => {
    it("creates client from CantonConfig", () => {
      const client = ValidatorClient.fromConfig(
        { ledgerApiUrl: "http://ledger:2975", validatorApiUrl: "http://validator:2903" },
        "token"
      );
      expect(client).toBeInstanceOf(ValidatorClient);
    });
  });
});

describe("normalizeValidatorUser", () => {
  it("handles snake_case", () => {
    const result = normalizeValidatorUser({ user_id: "u", primary_party: "P" });
    expect(result.userId).toBe("u");
    expect(result.primaryParty).toBe("P");
  });

  it("handles camelCase", () => {
    const result = normalizeValidatorUser({ userId: "u", primaryParty: "P" });
    expect(result.userId).toBe("u");
    expect(result.primaryParty).toBe("P");
  });
});

describe("normalizeDsoPartyId", () => {
  it("handles string", () => {
    const result = normalizeDsoPartyId("DSO::123");
    expect(result.dsoPartyId).toBe("DSO::123");
  });

  it("handles object", () => {
    const result = normalizeDsoPartyId({ dso_party_id: "DSO::456" });
    expect(result.dsoPartyId).toBe("DSO::456");
  });
});
