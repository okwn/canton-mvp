/**
 * Party identity service.
 * Orchestrates user, party, wallet, and permission operations.
 */

import type { PartyId } from "@canton-mvp/shared-types";
import type { AppUser, CantonParty, WalletIdentity, UserRole } from "../models/index.js";
import type { IPartyIdentityStore } from "../store/IPartyIdentityStore.js";

export interface CreateUserInput {
  id?: string;
  email?: string;
  externalId?: string;
  role?: UserRole;
}

export interface AllocatePartyInput {
  userId: string;
  partyId: PartyId;
  source: "validator" | "wallet" | "manual";
  displayName?: string;
  networkId?: string;
}

export interface AttachMetadataInput {
  partyId: PartyId;
  metadata: Record<string, unknown>;
}

export interface StoreWalletLinkageInput {
  userId: string;
  providerId: string;
  partyId: PartyId;
  walletAddress?: string;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export class PartyIdentityService {
  constructor(private readonly store: IPartyIdentityStore) {}

  async createUser(input: CreateUserInput): Promise<AppUser> {
    const now = Date.now();
    const user: AppUser = {
      id: input.id ?? generateId("usr"),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.externalId !== undefined && { externalId: input.externalId }),
      role: input.role ?? "user",
      createdAt: now,
      updatedAt: now,
    };
    return this.store.createUser(user);
  }

  async allocateParty(input: AllocatePartyInput): Promise<CantonParty> {
    const existing = await this.store.getParty(input.partyId);
    if (existing) {
      if (existing.userId !== input.userId) {
        throw new Error(`Party ${input.partyId} already linked to another user`);
      }
      return existing;
    }

    const now = Date.now();
    const party: CantonParty = {
      partyId: input.partyId,
      userId: input.userId,
      ...(input.displayName !== undefined && { displayName: input.displayName }),
      source: input.source,
      ...(input.networkId !== undefined && { networkId: input.networkId }),
      metadata: {},
      createdAt: now,
      updatedAt: now,
    };
    return this.store.createParty(party);
  }

  async linkParty(userId: string, partyId: PartyId, source: CantonParty["source"]): Promise<CantonParty> {
    return this.allocateParty({ userId, partyId, source });
  }

  async attachMetadata(input: AttachMetadataInput): Promise<CantonParty> {
    const party = await this.store.getParty(input.partyId);
    if (!party) throw new Error(`Party not found: ${input.partyId}`);
    const updated: CantonParty = {
      ...party,
      metadata: { ...party.metadata, ...input.metadata },
      updatedAt: Date.now(),
    };
    return this.store.updateParty(updated);
  }

  async storeWalletLinkage(input: StoreWalletLinkageInput): Promise<WalletIdentity> {
    const existing = await this.store.getWalletIdentityByUserAndParty(input.userId, input.partyId);
    if (existing) {
      return existing;
    }

    const now = Date.now();
    const wallet: WalletIdentity = {
      id: generateId("wal"),
      userId: input.userId,
      providerId: input.providerId,
      partyId: input.partyId,
      ...(input.walletAddress !== undefined && { walletAddress: input.walletAddress }),
      createdAt: now,
      updatedAt: now,
    };
    return this.store.createWalletIdentity(wallet);
  }

  async getUser(userId: string): Promise<AppUser | null> {
    return this.store.getUser(userId);
  }

  async getUserByExternalId(externalId: string): Promise<AppUser | null> {
    return this.store.getUserByExternalId(externalId);
  }

  async getPartiesForUser(userId: string): Promise<CantonParty[]> {
    return this.store.getPartiesByUserId(userId);
  }

  async listAllParties(limit?: number): Promise<CantonParty[]> {
    return this.store.listParties(limit);
  }

  async getPrimaryParty(userId: string): Promise<CantonParty | null> {
    const parties = await this.store.getPartiesByUserId(userId);
    return parties[0] ?? null;
  }

  async hasPermission(userId: string, permission: "admin" | "custodian"): Promise<boolean> {
    const user = await this.store.getUser(userId);
    if (!user) return false;
    return user.role === permission || user.role === "admin";
  }

  async inspectPermissions(userId: string): Promise<{ role: UserRole; isAdmin: boolean; isCustodian: boolean }> {
    const user = await this.store.getUser(userId);
    if (!user) {
      return { role: "user", isAdmin: false, isCustodian: false };
    }
    return {
      role: user.role,
      isAdmin: user.role === "admin",
      isCustodian: user.role === "custodian" || user.role === "admin",
    };
  }

  async resolvePartyId(userId: string): Promise<PartyId | undefined> {
    const party = await this.getPrimaryParty(userId);
    return party?.partyId;
  }
}
