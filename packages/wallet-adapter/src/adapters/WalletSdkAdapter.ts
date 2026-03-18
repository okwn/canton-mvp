/**
 * Wallet SDK style adapter (wallet-provider / exchange flows).
 * Lower-level: direct connect, allocate party, sign, submit.
 * Implement via @canton-network/wallet-sdk when available.
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

export interface WalletSdkAdapterConfig {
  validatorUrl: string;
  synchronizerId?: string;
}

/**
 * Wallet SDK adapter for wallet providers and exchanges.
 * In production, inject @canton-network/wallet-sdk.
 * This implementation throws; use MockWalletAdapter for local dev.
 */
export class WalletSdkAdapter implements IWalletProvider {
  readonly id = "wallet-sdk";
  readonly name = "Wallet SDK";

  readonly events = new WalletEventEmitter();

  constructor(_config: WalletSdkAdapterConfig) {
    // Stub: config reserved for future @canton-network/wallet-sdk integration
  }

  async connect(): Promise<WalletConnection> {
    throw new Error(
      "WalletSdkAdapter: inject @canton-network/wallet-sdk. Use MockWalletAdapter for local dev."
    );
  }

  async disconnect(): Promise<void> {
    this.events.emit("disconnect", { session: null });
  }

  async getSession(): Promise<WalletSession | null> {
    throw new Error("WalletSdkAdapter: implement via Wallet SDK session");
  }

  async detectSession(): Promise<WalletSession | null> {
    return this.getSession();
  }

  async prepareTransaction(_command: unknown): Promise<TransactionReview> {
    throw new Error("WalletSdkAdapter: implement via Wallet SDK prepare");
  }

  async requestSigning(_review: TransactionReview): Promise<SigningResult> {
    throw new Error("WalletSdkAdapter: implement via Wallet SDK sign");
  }

  async submitSignedTransaction(
    _commandId: string,
    _signedPayload: unknown
  ): Promise<SigningResult> {
    throw new Error("WalletSdkAdapter: implement via Wallet SDK submit");
  }

  async getHoldings(_partyId: PartyId): Promise<WalletHolding[]> {
    throw new Error("WalletSdkAdapter: implement via token standard");
  }
}
