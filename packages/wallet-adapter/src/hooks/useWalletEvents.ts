/**
 * Hook to subscribe to wallet events for UI state.
 */

import { useEffect } from "react";
import type { WalletEventType, WalletEventHandler } from "../interfaces/events.js";
import { useWalletProvider } from "./WalletProviderContext.js";

export function useWalletEvents<K extends WalletEventType>(
  event: K,
  handler: WalletEventHandler<K>
): void {
  const provider = useWalletProvider();
  const emitter = provider.events;

  useEffect(() => {
    if (!emitter) return;
    return emitter.on(event, handler);
  }, [emitter, event, handler]);
}
