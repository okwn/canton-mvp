/**
 * Wallet provider component.
 * Wrap your app with this and pass an IWalletProvider instance.
 */

import type { ReactNode, ReactElement } from "react";
import type { IWalletProvider } from "../interfaces/provider.js";
import { WalletProviderContext } from "./WalletProviderContext.js";

export interface WalletProviderProps {
  provider: IWalletProvider;
  children: ReactNode;
}

export function WalletProvider({ provider, children }: WalletProviderProps): ReactElement {
  return (
    <WalletProviderContext.Provider value={provider}>
      {children}
    </WalletProviderContext.Provider>
  );
}
