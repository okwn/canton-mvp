/**
 * @canton-mvp/validator-client
 *
 * Typed client for Canton Validator API.
 */

export { ValidatorClient } from "./client.js";
export type { ValidatorClientConfig } from "./client.js";
export { normalizeValidatorUser, normalizeDsoPartyId } from "./normalize.js";
export type { RawValidatorUser, RawDsoPartyIdResponse } from "./types.js";
