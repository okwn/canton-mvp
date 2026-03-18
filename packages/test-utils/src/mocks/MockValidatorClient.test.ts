import { describe, it, expect } from "vitest";
import { MockValidatorClient } from "./MockValidatorClient.js";

describe("MockValidatorClient", () => {
  it("returns default validator user", async () => {
    const client = new MockValidatorClient();
    const user = await client.getValidatorUser();
    expect(user.userId).toBe("mock-user");
    expect(user.primaryParty).toMatch(/^Alice::1220/);
  });

  it("returns custom validator user when provided", async () => {
    const client = new MockValidatorClient({
      validatorUser: { userId: "custom", primaryParty: "Custom::123" },
    });
    const user = await client.getValidatorUser();
    expect(user.userId).toBe("custom");
    expect(user.primaryParty).toBe("Custom::123");
  });

  it("returns default DSO party", async () => {
    const client = new MockValidatorClient();
    const dso = await client.getDsoPartyId();
    expect(dso.dsoPartyId).toMatch(/^DSO::1220/);
  });

  it("returns custom DSO party when provided", async () => {
    const client = new MockValidatorClient({ dsoPartyId: "DSO::custom" });
    const dso = await client.getDsoPartyId();
    expect(dso.dsoPartyId).toBe("DSO::custom");
  });

  it("getValidatorPartyMetadata returns both", async () => {
    const client = new MockValidatorClient();
    const meta = await client.getValidatorPartyMetadata();
    expect(meta.validatorUser.userId).toBeDefined();
    expect(meta.dsoParty.dsoPartyId).toBeDefined();
  });
});
