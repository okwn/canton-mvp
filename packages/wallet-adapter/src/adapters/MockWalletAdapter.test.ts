import { describe, it, expect, vi } from "vitest";
import { MockWalletAdapter } from "./MockWalletAdapter.js";

describe("MockWalletAdapter", () => {
  it("connects and returns session", async () => {
    const adapter = new MockWalletAdapter({ simulateDelayMs: 0 });
    const connection = await adapter.connect();

    expect(connection.session.partyId).toMatch(/^mock-party::1220a+$/);
    expect(connection.session.userId).toBe("mock-user");
    expect(connection.connectedAt).toBeGreaterThan(0);
  });

  it("uses custom partyId when configured", async () => {
    const customParty = "custom::1220" + "c".repeat(64);
    const adapter = new MockWalletAdapter({
      defaultPartyId: customParty,
      simulateDelayMs: 0,
    });
    const connection = await adapter.connect();

    expect(connection.session.partyId).toBe(customParty);
  });

  it("disconnects and clears session", async () => {
    const adapter = new MockWalletAdapter({ simulateDelayMs: 0 });
    await adapter.connect();
    await adapter.disconnect();

    const session = await adapter.getSession();
    expect(session).toBeNull();
  });

  it("prepareTransaction returns review", async () => {
    const adapter = new MockWalletAdapter({ simulateDelayMs: 0 });
    const review = await adapter.prepareTransaction({ foo: "bar" });

    expect(review.commandId).toMatch(/^mock-cmd-\d+$/);
    expect(review.summary).toBe("Mock transaction");
    expect(review.payload).toEqual({ foo: "bar" });
  });

  it("requestSigning returns success", async () => {
    const adapter = new MockWalletAdapter({ simulateDelayMs: 0 });
    const review = await adapter.prepareTransaction({});
    const result = await adapter.requestSigning(review);

    expect(result.success).toBe(true);
    expect(result.commandId).toBe(review.commandId);
    expect(result.transactionId).toMatch(/^mock-tx-\d+$/);
  });

  it("submitSignedTransaction returns success", async () => {
    const adapter = new MockWalletAdapter({ simulateDelayMs: 0 });
    const result = await adapter.submitSignedTransaction("cmd-1", { signed: true });

    expect(result.success).toBe(true);
    expect(result.commandId).toBe("cmd-1");
    expect(result.transactionId).toBeDefined();
  });

  it("getHoldings returns mock holdings", async () => {
    const adapter = new MockWalletAdapter({ simulateDelayMs: 0 });
    const holdings = await adapter.getHoldings("party::1220" + "a".repeat(64));

    expect(holdings).toHaveLength(1);
    expect(holdings[0]?.instrumentId.symbol).toBe("MOCK");
    expect(holdings[0]?.amount).toBe("1000");
  });

  it("emits connect event on connect", async () => {
    const adapter = new MockWalletAdapter({ simulateDelayMs: 0 });
    const onConnect = vi.fn();
    adapter.events.on("connect", onConnect);

    await adapter.connect();

    expect(onConnect).toHaveBeenCalledTimes(1);
    expect(onConnect.mock.calls[0]?.[0]).toHaveProperty("connection");
    expect(onConnect.mock.calls[0]?.[0].connection.session.partyId).toBeDefined();
  });

  it("emits disconnect event on disconnect", async () => {
    const adapter = new MockWalletAdapter({ simulateDelayMs: 0 });
    await adapter.connect();
    const onDisconnect = vi.fn();
    adapter.events.on("disconnect", onDisconnect);

    await adapter.disconnect();

    expect(onDisconnect).toHaveBeenCalledTimes(1);
    expect(onDisconnect.mock.calls[0]?.[0]).toHaveProperty("session");
  });
});
