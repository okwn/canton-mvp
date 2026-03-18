/**
 * Provider-agnostic wallet interfaces.
 * Apps depend only on these; vendor/protocol complexity is hidden.
 * Signing boundary: private keys never leave wallet; API receives only signed payloads.
 */

import type { PartyId } from "@canton-mvp/shared-types";
import type { WalletHolding } from "@canton-mvp/shared-types";

/** Active session (party + user context). */
export interface WalletSession {
  partyId: PartyId;
  userId?: string;
  networkId?: string;
}

/** Connection state. */
export interface WalletConnection {
  session: WalletSession;
  connectedAt: number;
}

/** Prepared transaction awaiting user review/signature. */
export interface TransactionReview {
  commandId: string;
  summary?: string;
  payload?: unknown;
}

/** Result of a signing request. */
export interface SigningResult {
  commandId: string;
  success: boolean;
  transactionId?: string;
  error?: string;
}

import type { IWalletEventEmitter } from "./events.js";

/** Wallet provider: connect, session, signing, holdings. */
export interface IWalletProvider {
  readonly id: string;
  readonly name: string;
  readonly events?: IWalletEventEmitter;

  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  getSession(): Promise<WalletSession | null>;
  detectSession(): Promise<WalletSession | null>;

  prepareTransaction(command: unknown): Promise<TransactionReview>;
  requestSigning(review: TransactionReview): Promise<SigningResult>;
  submitSignedTransaction(commandId: string, signedPayload: unknown): Promise<SigningResult>;

  getHoldings(partyId: PartyId): Promise<WalletHolding[]>;
}
