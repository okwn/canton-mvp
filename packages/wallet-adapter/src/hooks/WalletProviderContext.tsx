/**
 * React context for wallet provider.
 * Apps wrap with WalletProvider and pass an IWalletProvider instance.
 */

import { createContext, useContext } from "react";
import type { IWalletProvider } from "../interfaces/provider.js";

export const WalletProviderContext = createContext<IWalletProvider | null>(null);

export function useWalletProvider(): IWalletProvider {
  const provider = useContext(WalletProviderContext);
  if (!provider) {
    throw new Error("useWalletProvider must be used within WalletProvider");
  }
  return provider;
}
