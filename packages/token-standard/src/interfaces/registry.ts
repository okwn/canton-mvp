/**
 * Token registry lookup interfaces.
 * CIP-0056 aligned: tokens identified by admin party + symbol.
 */

import type { PartyId } from "@canton-mvp/shared-types";

/** Unique token identifier (CIP-0056 compatible). */
export interface TokenInstrumentId {
  admin: PartyId;
  symbol: string;
}

/** Token metadata from registry. */
export interface TokenRegistryEntry {
  instrumentId: TokenInstrumentId;
  name?: string;
  decimals?: number;
  /** Optional metadata for display / compliance. */
  metadata?: Record<string, unknown>;
}

/** Registry lookup interface. */
export interface ITokenRegistry {
  lookup(instrumentId: TokenInstrumentId): Promise<TokenRegistryEntry | null>;
  list(): Promise<TokenRegistryEntry[]>;
}
