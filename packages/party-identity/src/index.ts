/**
 * @canton-mvp/party-identity
 *
 * User and party mapping for Canton onboarding.
 */

import type { PartyId } from "@canton-mvp/shared-types";

// Models
export type { AppUser, UserRole } from "./models/AppUser.js";
export type { CantonParty } from "./models/CantonParty.js";
export type { WalletIdentity } from "./models/WalletIdentity.js";
export type { ConnectionSession } from "./models/ConnectionSession.js";

// Store
export type { IPartyIdentityStore } from "./store/IPartyIdentityStore.js";
export { InMemoryPartyIdentityStore } from "./store/InMemoryStore.js";

// Service
export { PartyIdentityService } from "./service/PartyIdentityService.js";
export type {
  CreateUserInput,
  AllocatePartyInput,
  AttachMetadataInput,
  StoreWalletLinkageInput,
} from "./service/PartyIdentityService.js";

// Legacy (for backward compatibility)
export interface PartyMapping {
  userId: string;
  partyId: PartyId;
}

export interface PartyIdentityResolver {
  resolvePartyId(userId: string): Promise<PartyId | undefined>;
}

export class InMemoryPartyResolver implements PartyIdentityResolver {
  constructor(private readonly mapping: Map<string, PartyId> = new Map()) {}

  add(userId: string, partyId: PartyId): void {
    this.mapping.set(userId, partyId);
  }

  async resolvePartyId(userId: string): Promise<PartyId | undefined> {
    return this.mapping.get(userId);
  }
}

export function extractUserIdFromJwt(_token: string): string | undefined {
  throw new Error("extractUserIdFromJwt: implement JWT parsing");
}
