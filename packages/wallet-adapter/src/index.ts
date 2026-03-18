/**
 * @canton-mvp/wallet-adapter
 *
 * Provider-agnostic wallet integration layer for Canton.
 * Supports dApp-style (CIP-103) and wallet-provider/exchange flows.
 */

// Interfaces
export type {
  WalletSession,
  WalletConnection,
  TransactionReview,
  SigningResult,
  IWalletProvider,
} from "./interfaces/provider.js";
export type {
  WalletEventType,
  WalletEventMap,
  WalletEventHandler,
  IWalletEventEmitter,
} from "./interfaces/events.js";

// Events
export { WalletEventEmitter } from "./events/index.js";

// Adapters
export {
  MockWalletAdapter,
  DappSdkAdapter,
  WalletSdkAdapter,
} from "./adapters/index.js";
export type {
  MockWalletAdapterConfig,
  DappSdkAdapterConfig,
  WalletSdkAdapterConfig,
} from "./adapters/index.js";

// Hooks (React)
export {
  WalletProvider,
  WalletProviderContext,
  useWalletProvider,
  useWalletConnection,
  useWalletSession,
  useWalletEvents,
} from "./hooks/index.js";
export type {
  WalletProviderProps,
  UseWalletConnectionResult,
  UseWalletSessionResult,
} from "./hooks/index.js";
