# Token Standard Abstraction

> CIP-0056 aligned app developer abstraction for token interoperability on Canton Network.

## Overview

The `@canton-mvp/token-standard` package provides a clean, app-facing layer for interacting with token-like assets uniformly. It is **not** the full protocol implementation—it is an abstraction that:

- Aligns with Canton Network CIP-0056 concepts
- Hides protocol and vendor complexity
- Stays future-friendly for swaps and DvP-style workflows

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         App Layer                                 │
│  (uses only token-standard interfaces, mappers, utils, schemas)   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                  @canton-mvp/token-standard                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Interfaces  │  │   Mappers   │  │  Utilities  │  │ Schemas  │ │
│  │ registry    │  │ Canton Coin │  │ settlement  │  │ (zod)    │ │
│  │ holdings    │  │ token-std   │  │ swapLegs    │  │          │ │
│  │ transfer    │  │             │  │ isBalanced  │  │          │ │
│  │ settlement  │  │             │  │             │  │          │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Canton Coin, CIP-0056 tokens, future token implementations       │
└─────────────────────────────────────────────────────────────────┘
```

## Interfaces

### Token Registry

| Type | Description |
|------|-------------|
| `TokenInstrumentId` | `{ admin: PartyId; symbol: string }` – unique token identifier |
| `TokenRegistryEntry` | `instrumentId`, `name?`, `decimals?`, `metadata?` |
| `ITokenRegistry` | `lookup(instrumentId)`, `list()` |

### Holdings & Balances

| Type | Description |
|------|-------------|
| `Holding` | `instrumentId`, `amount`, `contractId?`, `owner?` |
| `Balance` | `instrumentId`, `amount`, `totalHoldings?` |

### Transfer

| Type | Description |
|------|-------------|
| `TransferIntent` | `from`, `to`, `instrumentId`, `amount`, `referenceId?` |
| `TransferApproval` | `intent`, `status` (pending/approved/rejected), `approvalId?` |

### Settlement (multi-leg)

| Type | Description |
|------|-------------|
| `SettlementLeg` | `party`, `instrumentId`, `amount`, `direction` (debit/credit), `legId?` |
| `Settlement` | `legs[]`, `settlementId?` |

## Mappers

Mappers normalize raw ledger contract shapes to app-facing types.

### Canton Coin

```ts
import { mapCantonCoinHoldings, type CantonCoinHoldingRaw } from "@canton-mvp/token-standard";

const raw: CantonCoinHoldingRaw[] = [
  { contractId: "c1", owner: "party::...", instrumentId: { admin: "DSO::...", symbol: "CNT" }, amount: "100" },
];
const holdings = mapCantonCoinHoldings(raw);
```

### Token Standard (CIP-0056)

```ts
import { mapTokenStandardHoldings, type TokenStandardHoldingRaw } from "@canton-mvp/token-standard";

const raw: TokenStandardHoldingRaw[] = [...];
const holdings = mapTokenStandardHoldings(raw);
```

Supports both `symbol` and `id` in `instrumentId` for protocol flexibility.

## Utilities

### Multi-leg settlement

```ts
import {
  debitLeg,
  creditLeg,
  swapLegs,
  composeSettlement,
  isSettlementBalanced,
} from "@canton-mvp/token-standard";

// Simple swap: A gives X to B, B gives Y to A
const legs = swapLegs(
  partyA,
  { admin: "DSO::...", symbol: "CNT" },
  "100",
  partyB,
  { admin: "DSO::...", symbol: "CBTC" },
  "0.001"
);

const settlement = composeSettlement(legs, "swap-1");
if (isSettlementBalanced(settlement)) {
  // Ready for atomic submission
}
```

### Manual leg composition

```ts
const legs = [
  debitLeg(partyA, instrumentId, "50", "leg-1"),
  creditLeg(partyB, instrumentId, "50", "leg-2"),
];
const settlement = composeSettlement(legs);
```

### Balance aggregation

```ts
import { aggregateHoldingsToBalances } from "@canton-mvp/token-standard";

const holdings = [...]; // from mappers
const balances = aggregateHoldingsToBalances(holdings);
// balances: Balance[] with summed amounts per instrument
```

## Validation (Zod)

```ts
import {
  transferIntentSchema,
  settlementSchema,
  holdingSchema,
} from "@canton-mvp/token-standard";

const intent = transferIntentSchema.parse(input);
const settlement = settlementSchema.parse(legs);
const holding = holdingSchema.safeParse(raw);
```

Available schemas: `tokenInstrumentIdSchema`, `tokenRegistryEntrySchema`, `holdingSchema`, `balanceSchema`, `transferIntentSchema`, `transferApprovalSchema`, `settlementLegSchema`, `settlementSchema`.

## CIP-0056 Alignment

| CIP-0056 concept | Abstraction |
|------------------|-------------|
| Token identifier (admin + symbol/id) | `TokenInstrumentId` |
| Holdings / balances | `Holding`, `Balance` |
| Transfers | `TransferIntent`, `TransferApproval` |
| Multi-step transfers | `TransferApproval.status` |
| Atomic multi-leg (DvP, swap) | `Settlement`, `SettlementLeg` |

## Package Structure

```
packages/token-standard/src/
├── interfaces/
│   ├── registry.ts
│   ├── holdings.ts
│   ├── transfer.ts
│   ├── settlement.ts
│   └── index.ts
├── mappers/
│   ├── canton-coin.ts
│   ├── token-standard.ts
│   └── index.ts
├── utils/
│   ├── settlement.ts
│   └── index.ts
├── schemas/
│   ├── registry.ts
│   ├── holdings.ts
│   ├── transfer.ts
│   ├── settlement.ts
│   └── index.ts
└── index.ts
```

## Dependencies

- `@canton-mvp/shared-types` – `PartyId`, base types
- `zod` – validation schemas

## Future Extensions

- **Swaps**: `swapLegs` and `composeSettlement` already support atomic swap composition
- **DvP**: Same settlement model; add `deliveryLeg` / `paymentLeg` helpers if needed
- **Preapprovals**: `TransferApproval` is ready for preapproval workflows
- **New token types**: Add mappers in `mappers/` for new asset implementations
