/**
 * App user model.
 * Internal app identity, separate from ledger parties.
 */

export type UserRole = "user" | "admin" | "custodian";

export interface AppUser {
  id: string;
  email?: string;
  /** External auth provider id (e.g. OIDC sub). */
  externalId?: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
}
