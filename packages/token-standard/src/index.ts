/**
 * @canton-mvp/token-standard
 *
 * CIP-0056 aligned token interoperability abstraction.
 * App-facing interfaces, mappers, utilities, and validation.
 */

// Interfaces
export type {
  TokenInstrumentId,
  TokenRegistryEntry,
  ITokenRegistry,
} from "./interfaces/registry.js";
export type { Holding, Balance } from "./interfaces/holdings.js";
export type { TransferIntent, TransferApproval } from "./interfaces/transfer.js";
export type {
  SettlementLeg,
  SettlementLegDirection,
  Settlement,
} from "./interfaces/settlement.js";

// Mappers
export {
  mapCantonCoinHoldingToHolding,
  mapCantonCoinHoldings,
} from "./mappers/canton-coin.js";
export type { CantonCoinHoldingRaw } from "./mappers/canton-coin.js";
export {
  mapTokenStandardHoldingToHolding,
  mapTokenStandardHoldings,
} from "./mappers/token-standard.js";
export type { TokenStandardHoldingRaw } from "./mappers/token-standard.js";

// Utilities
export {
  debitLeg,
  creditLeg,
  swapLegs,
  composeSettlement,
  isSettlementBalanced,
  aggregateHoldingsToBalances,
} from "./utils/settlement.js";

// Schemas (zod)
export {
  tokenInstrumentIdSchema,
  tokenRegistryEntrySchema,
  holdingSchema,
  balanceSchema,
  transferIntentSchema,
  transferApprovalSchema,
  transferApprovalStatusSchema,
  settlementLegSchema,
  settlementSchema,
  settlementLegDirectionSchema,
} from "./schemas/index.js";
