/**
 * Party identity store interface.
 * Implement with in-memory, SQL, or other persistence.
 */

import type { AppUser, CantonParty, WalletIdentity, ConnectionSession } from "../models/index.js";
import type { PartyId } from "@canton-mvp/shared-types";

export interface IPartyIdentityStore {
  // Users
  createUser(user: AppUser): Promise<AppUser>;
  getUser(id: string): Promise<AppUser | null>;
  getUserByExternalId(externalId: string): Promise<AppUser | null>;
  updateUser(user: AppUser): Promise<AppUser>;

  // Parties
  createParty(party: CantonParty): Promise<CantonParty>;
  getParty(partyId: PartyId): Promise<CantonParty | null>;
  getPartiesByUserId(userId: string): Promise<CantonParty[]>;
  listParties(limit?: number): Promise<CantonParty[]>;
  updateParty(party: CantonParty): Promise<CantonParty>;

  // Wallet identities
  createWalletIdentity(wallet: WalletIdentity): Promise<WalletIdentity>;
  getWalletIdentity(id: string): Promise<WalletIdentity | null>;
  getWalletIdentitiesByUserId(userId: string): Promise<WalletIdentity[]>;
  getWalletIdentityByUserAndParty(userId: string, partyId: PartyId): Promise<WalletIdentity | null>;

  // Sessions
  createSession(session: ConnectionSession): Promise<ConnectionSession>;
  getSession(id: string): Promise<ConnectionSession | null>;
  deleteSession(id: string): Promise<void>;
}
