# Daml Domain Model

Domain model for canton-mvp Daml contracts. Optimized for composability, wallet-enabled apps, token flows, and swap-like workflows.

---

## 1. Module Overview

| Module | Purpose | Category |
|--------|---------|----------|
| **Types** | Shared types, status enums, InstrumentId | Primitives |
| **PartyProfile** | Identity / party profile | Primitives |
| **TransferApproval** | Pre-approval for transfers (CIP-0056 style) | Primitives |
| **AuditEvent** | Immutable audit record | Primitives |
| **AppRegistry** | Registry of apps | Registry |
| **AppConnection** | User ↔ app connection (onboarding) | Registry |
| **TokenIntent** | Single-leg token transfer intent | Intent |
| **QuoteRequest** | Request for a quote | Intent |
| **SwapIntent** | Swap proposal and agreed swap | Intent |
| **SettlementInstruction** | Settlement instruction for swap execution | Intent |

---

## 2. Separation: Primitives vs Example Flow

### Reusable primitives

- **PartyProfile** — Identity for any party; provider/subject roles
- **TransferApproval** — Pre-approval pattern; composable with token standards
- **AuditEvent** — Append-only audit; no choices
- **Types** — InstrumentId, Amount, IntentStatus

### Registry (onboarding)

- **AppRegistry** — App provider registers apps
- **AppConnection** — User connects to app; AppConnectionRequest → AppConnection

### Example business flow (swap)

- **TokenIntent** — Single transfer intent
- **QuoteRequest** → **SwapProposal** → **SwapIntent** → **SettlementInstruction**

The swap flow is an example; teams can replace it with their own workflows while reusing primitives.

---

## 3. Party Roles and Authority

| Contract | Signatory | Key choices | Controller |
|----------|-----------|-------------|------------|
| PartyProfile | provider | UpdateProfile | subject |
| TransferApproval | approver | Revoke | approver |
| AuditEvent | recorder | (none) | — |
| AppRegistry | provider | UpdateApp | provider |
| AppConnectionRequest | appProvider | RegisterUserAppConnection, WithdrawRequest | user, appProvider |
| AppConnection | user, appProvider | UserDisconnect, ProviderDisconnect | user, appProvider |
| TokenIntent | initiator | Cancel, SetRecipient | initiator |
| QuoteRequest | initiator | AcceptQuote, RejectQuote, CancelRequest | counterparty, initiator |
| SwapProposal | counterparty | ConfirmSwap, RejectProposal | initiator |
| SwapIntent | initiator, counterparty | PrepareSettlement, CancelIntent | both |
| SettlementInstruction | initiator, counterparty | FinalizeSwap, CancelSettlement | both |

---

## 4. Data Types

### InstrumentId

```daml
data InstrumentId = InstrumentId
  with
    admin: Party
    symbol: Text
```

CIP-0056 compatible: `admin` is token admin party; `symbol` identifies the instrument.

### IntentStatus

```daml
data IntentStatus = Pending | Accepted | Rejected | Cancelled | Finalized
```

Used for intent-like contracts (quote, swap, settlement).

### Amount

```daml
type Amount = Text
```

Decimal string (e.g. `"100.50"`). Future: replace with fixed-precision type.

---

## 5. Token Integration

- **InstrumentId** aligns with CIP-0056 token standard
- **TransferApproval** supports pre-approval flows
- **TokenIntent** is a single-leg transfer intent; can be composed with token contracts
- **SettlementInstruction** records settlement; actual token transfer is off-ledger or via token DARs (e.g. daml-finance)

---

## 6. Future Extensions

- Add daml-finance DAR dependency for token holdings
- Add interfaces (e.g. `Intent`, `Transferable`) for polymorphism
- Add `Quote` template (counterparty’s response) if needed
- Extend `AuditEvent` with structured payload (JSON)

---

*Last updated: March 2026.*
