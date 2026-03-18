/**
 * In-memory party identity store.
 */

import type { AppUser, CantonParty, WalletIdentity, ConnectionSession } from "../models/index.js";
import type { PartyId } from "@canton-mvp/shared-types";
import type { IPartyIdentityStore } from "./IPartyIdentityStore.js";

export class InMemoryPartyIdentityStore implements IPartyIdentityStore {
  private users = new Map<string, AppUser>();
  private parties = new Map<PartyId, CantonParty>();
  private partiesByUser = new Map<string, Set<PartyId>>();
  private walletIdentities = new Map<string, WalletIdentity>();
  private walletByUser = new Map<string, Set<string>>();
  private walletByUserParty = new Map<string, string>();
  private sessions = new Map<string, ConnectionSession>();

  async createUser(user: AppUser): Promise<AppUser> {
    this.users.set(user.id, { ...user });
    return { ...user };
  }

  async getUser(id: string): Promise<AppUser | null> {
    const u = this.users.get(id);
    return u ? { ...u } : null;
  }

  async getUserByExternalId(externalId: string): Promise<AppUser | null> {
    for (const u of this.users.values()) {
      if (u.externalId === externalId) return { ...u };
    }
    return null;
  }

  async updateUser(user: AppUser): Promise<AppUser> {
    this.users.set(user.id, { ...user, updatedAt: Date.now() });
    return this.users.get(user.id)!;
  }

  async createParty(party: CantonParty): Promise<CantonParty> {
    this.parties.set(party.partyId, { ...party });
    const set = this.partiesByUser.get(party.userId) ?? new Set();
    set.add(party.partyId);
    this.partiesByUser.set(party.userId, set);
    return { ...party };
  }

  async getParty(partyId: PartyId): Promise<CantonParty | null> {
    const p = this.parties.get(partyId);
    return p ? { ...p } : null;
  }

  async getPartiesByUserId(userId: string): Promise<CantonParty[]> {
    const set = this.partiesByUser.get(userId);
    if (!set) return [];
    return Array.from(set)
      .map((pid) => this.parties.get(pid))
      .filter((p): p is CantonParty => p != null)
      .map((p) => ({ ...p }));
  }

  async listParties(limit = 500): Promise<CantonParty[]> {
    const all = Array.from(this.parties.values())
      .map((p) => ({ ...p }))
      .sort((a, b) => b.createdAt - a.createdAt);
    return all.slice(0, limit);
  }

  async updateParty(party: CantonParty): Promise<CantonParty> {
    this.parties.set(party.partyId, { ...party, updatedAt: Date.now() });
    return this.parties.get(party.partyId)!;
  }

  async createWalletIdentity(wallet: WalletIdentity): Promise<WalletIdentity> {
    this.walletIdentities.set(wallet.id, { ...wallet });
    const set = this.walletByUser.get(wallet.userId) ?? new Set();
    set.add(wallet.id);
    this.walletByUser.set(wallet.userId, set);
    this.walletByUserParty.set(`${wallet.userId}::${wallet.partyId}`, wallet.id);
    return { ...wallet };
  }

  async getWalletIdentity(id: string): Promise<WalletIdentity | null> {
    const w = this.walletIdentities.get(id);
    return w ? { ...w } : null;
  }

  async getWalletIdentitiesByUserId(userId: string): Promise<WalletIdentity[]> {
    const set = this.walletByUser.get(userId);
    if (!set) return [];
    return Array.from(set)
      .map((id) => this.walletIdentities.get(id))
      .filter((w): w is WalletIdentity => w != null)
      .map((w) => ({ ...w }));
  }

  async getWalletIdentityByUserAndParty(userId: string, partyId: PartyId): Promise<WalletIdentity | null> {
    const id = this.walletByUserParty.get(`${userId}::${partyId}`);
    return id ? this.getWalletIdentity(id) : null;
  }

  async createSession(session: ConnectionSession): Promise<ConnectionSession> {
    this.sessions.set(session.id, { ...session });
    return { ...session };
  }

  async getSession(id: string): Promise<ConnectionSession | null> {
    const s = this.sessions.get(id);
    return s ? { ...s } : null;
  }

  async deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
  }
}
