/**
 * Wallet event types for UI state and lifecycle hooks.
 */

import type { WalletSession, WalletConnection, TransactionReview, SigningResult } from "./provider.js";

export type WalletEventType =
  | "connect"
  | "disconnect"
  | "sessionChange"
  | "signingRequested"
  | "signingCompleted"
  | "transactionSubmitted"
  | "error";

export interface WalletEventMap {
  connect: { connection: WalletConnection };
  disconnect: { session: WalletSession | null };
  sessionChange: { session: WalletSession | null };
  signingRequested: { review: TransactionReview };
  signingCompleted: { result: SigningResult };
  transactionSubmitted: { result: SigningResult };
  error: { error: Error };
}

export type WalletEventHandler<K extends WalletEventType> = (payload: WalletEventMap[K]) => void;

export interface IWalletEventEmitter {
  on<K extends WalletEventType>(event: K, handler: WalletEventHandler<K>): () => void;
  off<K extends WalletEventType>(event: K, handler: WalletEventHandler<K>): void;
  emit<K extends WalletEventType>(event: K, payload: WalletEventMap[K]): void;
}
