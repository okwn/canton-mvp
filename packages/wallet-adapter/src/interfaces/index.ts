/**
 * Wallet adapter interfaces.
 */

export type {
  WalletSession,
  WalletConnection,
  TransactionReview,
  SigningResult,
  IWalletProvider,
} from "./provider.js";
export type {
  WalletEventType,
  WalletEventMap,
  WalletEventHandler,
  IWalletEventEmitter,
} from "./events.js";
