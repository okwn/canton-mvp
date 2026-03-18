/**
 * dApp SDK style adapter (CIP-103).
 * Wraps Wallet Gateway / dApp SDK: connect, prepare, execute.
 * Implement via @canton-network/dapp-sdk when available.
 */

import type { PartyId } from "@canton-mvp/shared-types";
import type { WalletHolding } from "@canton-mvp/shared-types";
import type {
  IWalletProvider,
  WalletSession,
  WalletConnection,
  TransactionReview,
  SigningResult,
} from "../interfaces/provider.js";
import { WalletEventEmitter } from "../events/WalletEventEmitter.js";

export interface DappSdkAdapterConfig {
  gatewayUrl: string;
  networkId?: string;
}

/**
 * dApp SDK adapter.
 * In production, inject @canton-network/dapp-sdk provider.
 * This implementation throws; use MockWalletAdapter for local dev.
 */
export class DappSdkAdapter implements IWalletProvider {
  readonly id = "dapp-sdk";
  readonly name = "Wallet Gateway (dApp SDK)";

  readonly events = new WalletEventEmitter();

  constructor(_config: DappSdkAdapterConfig) {
    // Stub: config reserved for future @canton-network/dapp-sdk integration
  }

  async connect(): Promise<WalletConnection> {
    throw new Error(
      "DappSdkAdapter: inject @canton-network/dapp-sdk provider. Use MockWalletAdapter for local dev."
    );
  }

  async disconnect(): Promise<void> {
    this.events.emit("disconnect", { session: null });
  }

  async getSession(): Promise<WalletSession | null> {
    throw new Error("DappSdkAdapter: implement via dApp SDK session");
  }

  async detectSession(): Promise<WalletSession | null> {
    return this.getSession();
  }

  async prepareTransaction(_command: unknown): Promise<TransactionReview> {
    throw new Error("DappSdkAdapter: implement via dApp SDK prepare");
  }

  async requestSigning(_review: TransactionReview): Promise<SigningResult> {
    throw new Error("DappSdkAdapter: implement via dApp SDK execute");
  }

  async submitSignedTransaction(
    _commandId: string,
    _signedPayload: unknown
  ): Promise<SigningResult> {
    throw new Error("DappSdkAdapter: implement via dApp SDK submit");
  }

  async getHoldings(_partyId: PartyId): Promise<WalletHolding[]> {
    throw new Error("DappSdkAdapter: implement via token standard / ledger");
  }
}
