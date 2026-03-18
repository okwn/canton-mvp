/**
 * @canton-mvp/test-utils
 *
 * Shared test utilities, mocks, and fixtures.
 */

import type { CantonConfig } from "@canton-mvp/shared-types";

export const MOCK_CANTON_CONFIG: CantonConfig = {
  ledgerApiUrl: "http://canton.localhost:2975",
  validatorApiUrl: "http://canton.localhost:2903",
  scanApiUrl: "http://scan.localhost:4000",
};

export function createMockPartyId(prefix: string, suffix?: string): string {
  const s = suffix ?? Math.random().toString(36).slice(2, 10);
  return `${prefix}::1220${s.padEnd(64, "0").slice(0, 64)}`;
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { MockValidatorClient } from "./mocks/MockValidatorClient.js";
export type { MockValidatorClientOptions } from "./mocks/MockValidatorClient.js";
export { MockScanClient } from "./mocks/MockScanClient.js";
export type { MockScanClientOptions } from "./mocks/MockScanClient.js";
export {
  createMockLedgerFetch,
  type MockLedgerResponse,
} from "./mocks/MockLedgerTransport.js";
export * from "./fixtures/daml-payloads.js";
