/**
 * Application context - shared services and stores.
 */

import type { Env } from "./config/env.js";
import type { TokenValidator } from "./modules/auth/auth.strategy.js";
import {
  InMemoryPartyIdentityStore,
  PartyIdentityService,
} from "@canton-mvp/party-identity";
import {
  InMemorySwapEngineStore,
  SwapEngine,
  SwapEngineEventEmitter,
} from "@canton-mvp/swap-engine";
import { MockWalletAdapter } from "@canton-mvp/wallet-adapter";
import { ValidatorClient } from "@canton-mvp/validator-client";
import type { CantonConfig } from "@canton-mvp/shared-types";
import type { IWalletProvider } from "@canton-mvp/wallet-adapter";
import { OpsStore } from "./ops/OpsStore.js";
import { createJwtValidator, createDevTokenValidator } from "./modules/auth/auth.strategy.js";

export interface AppContext {
  identity: PartyIdentityService;
  swapEngine: SwapEngine;
  walletProvider: IWalletProvider;
  validatorClient?: ValidatorClient;
  cantonConfig?: CantonConfig;
  opsStore: OpsStore;
  authValidator: TokenValidator;
}

export async function createAppContext(env: Env): Promise<AppContext> {
  const identityStore = new InMemoryPartyIdentityStore();
  const identity = new PartyIdentityService(identityStore);

  const swapStore = new InMemorySwapEngineStore();
  const swapEvents = new SwapEngineEventEmitter();
  const swapEngine = new SwapEngine({ store: swapStore, events: swapEvents });

  const walletProvider = new MockWalletAdapter({ simulateDelayMs: 0 });

  // TODO(production): Wire mTLS client cert/key when MTLS_CLIENT_CERT_PATH set.
  let validatorClient: ValidatorClient | undefined;
  let cantonConfig: CantonConfig | undefined;
  if (env.VALIDATOR_API_URL) {
    cantonConfig = {
      ledgerApiUrl: env.LEDGER_API_URL ?? env.VALIDATOR_API_URL,
      validatorApiUrl: env.VALIDATOR_API_URL,
      ...(env.SCAN_API_URL !== undefined && { scanApiUrl: env.SCAN_API_URL }),
    };
    validatorClient = ValidatorClient.fromConfig(cantonConfig);
  }

  const opsStore = new OpsStore(200);

  const authValidator = env.AUTH_JWT_SECRET
    ? await createJwtValidator(env.AUTH_JWT_SECRET)
    : createDevTokenValidator();

  return {
    identity,
    swapEngine,
    walletProvider,
    ...(validatorClient !== undefined && { validatorClient }),
    ...(cantonConfig !== undefined && { cantonConfig }),
    opsStore,
    authValidator,
  };
}
