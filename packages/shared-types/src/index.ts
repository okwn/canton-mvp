/**
 * @canton-mvp/shared-types
 *
 * Shared TypeScript types and constants for canton-mvp.
 */

export type PartyId = string;
export type ContractId = string;
export type LedgerOffset = string;

export interface CantonConfig {
  ledgerApiUrl: string;
  validatorApiUrl?: string;
  scanApiUrl?: string;
}

// --- Normalized DTOs (app-facing, transport-agnostic) ---

/** Network / synchronizer metadata. */
export interface NetworkMetadata {
  synchronizerId?: string;
  domainId?: string;
  participantId?: string;
}

/** Scan service info (normalized from Scan API). */
export interface ScanInfo {
  scanId?: string;
  url?: string;
  synchronizerId?: string;
}

/** List of scans (normalized). */
export interface ScanList {
  scans: ScanInfo[];
}

/** Validator user data (normalized from Validator API). */
export interface ValidatorUserInfo {
  userId?: string;
  primaryParty?: PartyId;
  identityProviderId?: string;
}

/** DSO (Decentralized Synchronizer Operator) party metadata. */
export interface DsoPartyInfo {
  dsoPartyId: PartyId;
  svPartyId?: PartyId;
}

/** Token instrument reference (CIP-0056 compatible). */
export interface TokenInstrumentInfo {
  adminPartyId: PartyId;
  symbol: string;
}

/** Transfer factory / registry endpoint info. */
export interface TransferRegistryInfo {
  transferFactoryUrl?: string;
  registryPartyId?: PartyId;
}

/** Wallet holding (balance view for UI). */
export interface WalletHolding {
  instrumentId: { admin: PartyId; symbol: string };
  amount: string;
  contractId?: string;
}

export const PACKAGE_NAME = "@canton-mvp/shared-types";
