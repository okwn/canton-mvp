/**
 * Raw Validator API transport shapes.
 * Separate from normalized DTOs in shared-types.
 */

/** Raw validator-user response from /api/validator/v0/validator-user. */
export interface RawValidatorUser {
  user_id?: string;
  primary_party?: string;
  identity_provider_id?: string;
  [key: string]: unknown;
}

/** Raw DSO party ID response from scan-proxy. */
export type RawDsoPartyIdResponse = string | { dso_party_id?: string };
