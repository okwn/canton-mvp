/**
 * Mock Validator API client for tests.
 * Returns fixture data without network calls.
 */

import type { ValidatorUserInfo, DsoPartyInfo } from "@canton-mvp/shared-types";

export interface MockValidatorClientOptions {
  validatorUser?: Partial<ValidatorUserInfo>;
  dsoPartyId?: string;
}

export class MockValidatorClient {
  private readonly opts: MockValidatorClientOptions;

  constructor(opts: MockValidatorClientOptions = {}) {
    this.opts = opts;
  }

  async getValidatorUser(): Promise<ValidatorUserInfo> {
    return {
      userId: this.opts.validatorUser?.userId ?? "mock-user",
      primaryParty: this.opts.validatorUser?.primaryParty ?? "Alice::1220" + "a".repeat(64),
      identityProviderId: this.opts.validatorUser?.identityProviderId ?? "mock-idp",
    };
  }

  async getDsoPartyId(): Promise<DsoPartyInfo> {
    return {
      dsoPartyId: this.opts.dsoPartyId ?? "DSO::1220" + "b".repeat(64),
    };
  }

  async getValidatorPartyMetadata(): Promise<{
    validatorUser: ValidatorUserInfo;
    dsoParty: DsoPartyInfo;
  }> {
    const [validatorUser, dsoParty] = await Promise.all([
      this.getValidatorUser(),
      this.getDsoPartyId(),
    ]);
    return { validatorUser, dsoParty };
  }
}
