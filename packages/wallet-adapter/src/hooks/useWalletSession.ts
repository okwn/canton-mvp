/**
 * Hook for wallet session state (active party/user).
 */

import { useState, useCallback, useEffect } from "react";
import type { WalletSession } from "../interfaces/provider.js";
import { useWalletProvider } from "./WalletProviderContext.js";

export interface UseWalletSessionResult {
  session: WalletSession | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useWalletSession(): UseWalletSessionResult {
  const provider = useWalletProvider();
  const [session, setSession] = useState<WalletSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const s = await provider.getSession();
      setSession(s);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const emitter = provider.events;
    if (!emitter) return;
    const unsub = emitter.on("connect", () => refresh());
    return unsub;
  }, [provider.events, refresh]);

  useEffect(() => {
    const emitter = provider.events;
    if (!emitter) return;
    const unsub = emitter.on("disconnect", () => setSession(null));
    return unsub;
  }, [provider.events]);

  return { session, isLoading, error, refresh };
}
