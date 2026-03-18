import { describe, it, expect } from "vitest";
import { InMemoryPartyIdentityStore } from "../store/InMemoryStore.js";
import { PartyIdentityService } from "./PartyIdentityService.js";

describe("PartyIdentityService onboarding flows", () => {
  const store = new InMemoryPartyIdentityStore();
  const service = new PartyIdentityService(store);

  it("creates user and allocates validator party", async () => {
    const user = await service.createUser({
      email: "alice@example.com",
      externalId: "oidc-sub-123",
      role: "user",
    });
    expect(user.id).toBeDefined();
    expect(user.email).toBe("alice@example.com");
    expect(user.role).toBe("user");

    const partyId = "party::1220" + "a".repeat(64);
    const party = await service.allocateParty({
      userId: user.id,
      partyId,
      source: "validator",
      displayName: "Alice Primary",
    });
    expect(party.partyId).toBe(partyId);
    expect(party.userId).toBe(user.id);
    expect(party.source).toBe("validator");
  });

  it("stores wallet linkage for external-party flow", async () => {
    const user = await service.createUser({ email: "bob@example.com" });
    const partyId = "party::1220" + "b".repeat(64);

    await service.allocateParty({
      userId: user.id,
      partyId,
      source: "wallet",
    });

    const wallet = await service.storeWalletLinkage({
      userId: user.id,
      providerId: "dapp-sdk",
      partyId,
      walletAddress: "0x123",
    });
    expect(wallet.userId).toBe(user.id);
    expect(wallet.partyId).toBe(partyId);
    expect(wallet.providerId).toBe("dapp-sdk");
  });

  it("attaches metadata to party", async () => {
    const user = await service.createUser({});
    const partyId = "party::1220" + "c".repeat(64);
    await service.allocateParty({ userId: user.id, partyId, source: "manual" });

    const updated = await service.attachMetadata({
      partyId,
      metadata: { label: "Test Party", network: "main" },
    });
    expect(updated.metadata?.["label"]).toBe("Test Party");
    expect(updated.metadata?.["network"]).toBe("main");
  });

  it("inspects permissions", async () => {
    const adminUser = await service.createUser({ role: "admin" });
    const regularUser = await service.createUser({ role: "user" });

    const adminPerms = await service.inspectPermissions(adminUser.id);
    expect(adminPerms.isAdmin).toBe(true);
    expect(adminPerms.isCustodian).toBe(true);

    const userPerms = await service.inspectPermissions(regularUser.id);
    expect(userPerms.isAdmin).toBe(false);
    expect(userPerms.isCustodian).toBe(false);
  });

  it("resolves primary party for user", async () => {
    const user = await service.createUser({});
    const partyId = "party::1220" + "d".repeat(64);
    await service.allocateParty({ userId: user.id, partyId, source: "validator" });

    const resolved = await service.resolvePartyId(user.id);
    expect(resolved).toBe(partyId);
  });

  it("rejects linking party to different user", async () => {
    const user1 = await service.createUser({});
    const user2 = await service.createUser({});
    const partyId = "party::1220" + "e".repeat(64);

    await service.allocateParty({ userId: user1.id, partyId, source: "validator" });

    await expect(
      service.allocateParty({ userId: user2.id, partyId, source: "validator" })
    ).rejects.toThrow("already linked to another user");
  });
});
