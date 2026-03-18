/**
 * Hook for wallet connection state.
 */

import { useState, useCallback, useEffect } from "react";
import type { WalletConnection } from "../interfaces/provider.js";
import { useWalletProvider } from "./WalletProviderContext.js";

export interface UseWalletConnectionResult {
  connection: WalletConnection | null;
  isConnecting: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useWalletConnection(): UseWalletConnectionResult {
  const provider = useWalletProvider();
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    provider
      .detectSession()
      .then((session) => {
        if (session) {
          setConnection({ session, connectedAt: Date.now() });
        }
      })
      .catch(() => {});
  }, [provider]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const conn = await provider.connect();
      setConnection(conn);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      provider.events?.emit("error", { error: e instanceof Error ? e : new Error(String(e)) });
    } finally {
      setIsConnecting(false);
    }
  }, [provider]);

  const disconnect = useCallback(async () => {
    setError(null);
    try {
      await provider.disconnect();
      setConnection(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, [provider]);

  return { connection, isConnecting, error, connect, disconnect };
}
