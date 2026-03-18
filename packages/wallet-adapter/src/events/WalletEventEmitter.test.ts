import { describe, it, expect, vi } from "vitest";
import { WalletEventEmitter } from "./WalletEventEmitter.js";

describe("WalletEventEmitter", () => {
  it("calls handler when event is emitted", () => {
    const emitter = new WalletEventEmitter();
    const handler = vi.fn();
    emitter.on("connect", handler);

    emitter.emit("connect", { connection: { session: { partyId: "p1" }, connectedAt: 1 } });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0]).toEqual({
      connection: { session: { partyId: "p1" }, connectedAt: 1 },
    });
  });

  it("unsubscribe removes handler", () => {
    const emitter = new WalletEventEmitter();
    const handler = vi.fn();
    const unsub = emitter.on("connect", handler);
    unsub();

    emitter.emit("connect", { connection: { session: { partyId: "p1" }, connectedAt: 1 } });

    expect(handler).not.toHaveBeenCalled();
  });

  it("off removes handler", () => {
    const emitter = new WalletEventEmitter();
    const handler = vi.fn();
    emitter.on("connect", handler);
    emitter.off("connect", handler);

    emitter.emit("connect", { connection: { session: { partyId: "p1" }, connectedAt: 1 } });

    expect(handler).not.toHaveBeenCalled();
  });
});
