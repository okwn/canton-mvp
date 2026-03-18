/**
 * Wallet identity model.
 * Links app user to external wallet / party.
 */

import type { PartyId } from "@canton-mvp/shared-types";

export interface WalletIdentity {
  id: string;
  userId: string;
  /** Wallet provider id (e.g. dapp-sdk, wallet-sdk, mock). */
  providerId: string;
  /** Party from wallet session. */
  partyId: PartyId;
  /** Optional wallet-specific identifier. */
  walletAddress?: string;
  createdAt: number;
  updatedAt: number;
}
