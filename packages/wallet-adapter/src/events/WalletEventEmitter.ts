/**
 * Simple event emitter for wallet lifecycle.
 */

import type { WalletEventType, WalletEventHandler, IWalletEventEmitter } from "../interfaces/events.js";

type Handler = (payload: unknown) => void;

export class WalletEventEmitter implements IWalletEventEmitter {
  private readonly listeners = new Map<WalletEventType, Set<Handler>>();

  on<K extends WalletEventType>(event: K, handler: WalletEventHandler<K>): () => void {
    const set = this.listeners.get(event) ?? new Set();
    set.add(handler as Handler);
    this.listeners.set(event, set);
    return () => this.off(event, handler);
  }

  off<K extends WalletEventType>(event: K, handler: WalletEventHandler<K>): void {
    this.listeners.get(event)?.delete(handler as Handler);
  }

  emit<K extends WalletEventType>(event: K, payload: Parameters<WalletEventHandler<K>>[0]): void {
    this.listeners.get(event)?.forEach((h) => h(payload));
  }
}
