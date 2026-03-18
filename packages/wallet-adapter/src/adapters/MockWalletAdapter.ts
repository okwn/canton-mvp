/**
 * Mock wallet provider for local development.
 * No external dependencies; simulates connect, session, signing.
 * TODO(production): Use DappSdkAdapter or WalletSdkAdapter; never MockWalletAdapter.
 */

import type { PartyId } from "@canton-mvp/shared-types";
import type { WalletHolding } from "@canton-mvp/shared-types";
import type {
  IWalletProvider,
  WalletSession,
  WalletConnection,
  TransactionReview,
  SigningResult,
} from "../interfaces/provider.js";
import { WalletEventEmitter } from "../events/WalletEventEmitter.js";

export interface MockWalletAdapterConfig {
  defaultPartyId?: PartyId;
  defaultUserId?: string;
  networkId?: string;
  simulateDelayMs?: number;
}

/** Resolved config with required defaults (avoids exactOptionalPropertyTypes issues). */
interface ResolvedMockConfig {
  defaultPartyId: string;
  defaultUserId: string;
  networkId: string;
  simulateDelayMs: number;
}

export class MockWalletAdapter implements IWalletProvider {
  readonly id = "mock";
  readonly name = "Mock Wallet";

  private session: WalletSession | null = null;
  private readonly config: ResolvedMockConfig;
  readonly events = new WalletEventEmitter();

  constructor(config: MockWalletAdapterConfig = {}) {
    this.config = {
      defaultPartyId: config.defaultPartyId ?? "mock-party::1220" + "a".repeat(64),
      defaultUserId: config.defaultUserId ?? "mock-user",
      networkId: config.networkId ?? "mock-network",
      simulateDelayMs: config.simulateDelayMs ?? 100,
    };
  }

  async connect(): Promise<WalletConnection> {
    await this.delay();
    const session: WalletSession = {
      partyId: this.config.defaultPartyId,
      userId: this.config.defaultUserId,
      networkId: this.config.networkId,
    };
    this.session = session;
    const connection: WalletConnection = {
      session,
      connectedAt: Date.now(),
    };
    this.events.emit("connect", { connection });
    return connection;
  }

  async disconnect(): Promise<void> {
    await this.delay();
    const prev = this.session;
    this.session = null;
    this.events.emit("disconnect", { session: prev });
  }

  async getSession(): Promise<WalletSession | null> {
    await this.delay();
    return this.session;
  }

  async detectSession(): Promise<WalletSession | null> {
    return this.getSession();
  }

  async prepareTransaction(command: unknown): Promise<TransactionReview> {
    await this.delay();
    const commandId = `mock-cmd-${Date.now()}`;
    const review: TransactionReview = {
      commandId,
      summary: "Mock transaction",
      payload: command,
    };
    this.events.emit("signingRequested", { review });
    return review;
  }

  async requestSigning(review: TransactionReview): Promise<SigningResult> {
    await this.delay();
    const result: SigningResult = {
      commandId: review.commandId,
      success: true,
      transactionId: `mock-tx-${Date.now()}`,
    };
    this.events.emit("signingCompleted", { result });
    this.events.emit("transactionSubmitted", { result });
    return result;
  }

  async submitSignedTransaction(
    commandId: string,
    _signedPayload: unknown
  ): Promise<SigningResult> {
    await this.delay();
    const result: SigningResult = {
      commandId,
      success: true,
      transactionId: `mock-tx-${Date.now()}`,
    };
    this.events.emit("transactionSubmitted", { result });
    return result;
  }

  async getHoldings(_partyId: PartyId): Promise<WalletHolding[]> {
    await this.delay();
    return [
      {
        instrumentId: { admin: "DSO::1220" + "b".repeat(64), symbol: "MOCK" },
        amount: "1000",
      },
    ];
  }

  private delay(): Promise<void> {
    const ms = this.config.simulateDelayMs ?? 0;
    return ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve();
  }
}
