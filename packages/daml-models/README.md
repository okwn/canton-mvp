# @canton-mvp/daml-models

Daml contract layer for canton-mvp: reusable primitives and example swap flow.

## Modules

| Module | Purpose |
|--------|---------|
| Types | InstrumentId, Amount, IntentStatus |
| PartyProfile | Identity / party profile |
| TransferApproval | Pre-approval for transfers |
| AuditEvent | Immutable audit record |
| AppRegistry | App registry |
| AppConnection | User ↔ app connection |
| TokenIntent | Single-leg token intent |
| QuoteRequest | Quote request |
| SwapIntent | Swap proposal and intent |
| SettlementInstruction | Settlement instruction |

## Build

```bash
# TypeScript only (no Daml SDK)
pnpm build

# Full build (requires Daml SDK)
pnpm run build:daml
pnpm run build:codegen
pnpm build
```

## Docs

- [Domain Model](../../docs/daml-domain-model.md)
- [Choice Flow](../../docs/daml-choice-flow.md)
