/**
 * Normalize raw Validator API responses to app-facing DTOs.
 */

import type { ValidatorUserInfo, DsoPartyInfo } from "@canton-mvp/shared-types";
import type { RawValidatorUser, RawDsoPartyIdResponse } from "./types.js";

export function normalizeValidatorUser(raw: RawValidatorUser): ValidatorUserInfo {
  return {
    userId: String(raw["user_id"] ?? raw["userId"] ?? ""),
    primaryParty: String(raw["primary_party"] ?? raw["primaryParty"] ?? ""),
    identityProviderId: String(raw["identity_provider_id"] ?? raw["identityProviderId"] ?? ""),
  };
}

export function normalizeDsoPartyId(raw: RawDsoPartyIdResponse): DsoPartyInfo {
  const id =
    typeof raw === "string"
      ? raw
      : String((raw as { dso_party_id?: string; dsoPartyId?: string })["dso_party_id"] ?? (raw as { dsoPartyId?: string })["dsoPartyId"] ?? "");
  return {
    dsoPartyId: id,
  };
}
