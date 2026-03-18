# Daml Choice Flow

Choice flows for canton-mvp Daml contracts. Covers request quote, accept quote, prepare settlement, cancel intent, finalize swap, and register user app connection.

---

## 1. Swap Flow (Quote → Swap → Settlement)

```
Initiator                    Counterparty
    |                             |
    | 1. Create QuoteRequest      |
    |---------------------------->|
    |                             |
    | 2. AcceptQuote (amount)     |
    |<----------------------------|
    |    (creates SwapProposal)   |
    |                             |
    | 3. ConfirmSwap             |
    |---------------------------->|
    |    (creates SwapIntent)     |
    |                             |
    | 4. PrepareSettlement       |
    |<---------------------------->|
    |    (archives SwapIntent,    |
    |     creates SettlementInstruction) |
    |                             |
    | 5. FinalizeSwap            |
    |<---------------------------->|
    |    (archives SettlementInstruction) |
```

---

## 2. Choice Reference

### Request Quote

**Template**: `QuoteRequest`  
**Choice**: (creation only; no choice)  
**Controller**: Initiator creates the contract

```
create QuoteRequest with
  initiator = alice
  counterparty = bob
  initiatorInstrument = InstrumentId admin "TOKEN_A"
  counterpartyInstrument = InstrumentId admin "TOKEN_B"
  initiatorAmount = "100"
  expiry = None
```

---

### Accept Quote

**Template**: `QuoteRequest`  
**Choice**: `AcceptQuote`  
**Controller**: counterparty  
**Argument**: `counterpartyAmount: Amount`  
**Effect**: Creates `SwapProposal`; archives `QuoteRequest`

```
exercise choice AcceptQuote with counterpartyAmount = "50"
```

---

### Reject Quote

**Template**: `QuoteRequest`  
**Choice**: `RejectQuote`  
**Controller**: counterparty  
**Effect**: Archives `QuoteRequest`

---

### Confirm Swap (Accept Proposal)

**Template**: `SwapProposal`  
**Choice**: `ConfirmSwap`  
**Controller**: initiator  
**Effect**: Creates `SwapIntent`; archives `SwapProposal`

---

### Reject Proposal

**Template**: `SwapProposal`  
**Choice**: `RejectProposal`  
**Controller**: initiator  
**Effect**: Archives `SwapProposal`

---

### Prepare Settlement

**Template**: `SwapIntent`  
**Choice**: `PrepareSettlement`  
**Controller**: initiator **and** counterparty (both must authorize)  
**Effect**: Creates `SettlementInstruction`; archives `SwapIntent`

---

### Cancel Intent

**Template**: `SwapIntent`  
**Choice**: `CancelIntent`  
**Controller**: initiator **and** counterparty  
**Effect**: Archives `SwapIntent`

---

### Finalize Swap

**Template**: `SettlementInstruction`  
**Choice**: `FinalizeSwap`  
**Controller**: initiator **and** counterparty  
**Effect**: Archives `SettlementInstruction` (records completion; actual token transfer is off-ledger or via token contracts)

---

### Cancel Settlement

**Template**: `SettlementInstruction`  
**Choice**: `CancelSettlement`  
**Controller**: initiator **and** counterparty  
**Effect**: Archives `SettlementInstruction`

---

## 3. App Connection Flow

```
App Provider                 User
    |                          |
    | 1. Create AppConnectionRequest |
    |------------------------------->|
    |                          |
    | 2. RegisterUserAppConnection  |
    |<------------------------------|
    |    (creates AppConnection)    |
```

### Register User App Connection

**Template**: `AppConnectionRequest`  
**Choice**: `RegisterUserAppConnection`  
**Controller**: user  
**Effect**: Creates `AppConnection`; archives `AppConnectionRequest`

---

### Disconnect

**Template**: `AppConnection`  
**Choices**: `UserDisconnect` or `ProviderDisconnect`  
**Controller**: user **or** appProvider (either can disconnect)  
**Effect**: Archives `AppConnection`

---

## 4. Token Intent Flow

### Create Token Intent

Initiator creates `TokenIntent` with optional recipient.

### Cancel Token Intent

**Template**: `TokenIntent`  
**Choice**: `Cancel`  
**Controller**: initiator

### Set Recipient

**Template**: `TokenIntent`  
**Choice**: `SetRecipient`  
**Controller**: initiator  
**Argument**: `newRecipient: Party`  
**Effect**: Creates new `TokenIntent` with recipient set

---

## 5. Transfer Approval Flow

### Create Transfer Approval

Approver creates `TransferApproval` (pre-approval for beneficiary).

### Revoke

**Template**: `TransferApproval`  
**Choice**: `Revoke`  
**Controller**: approver  
**Effect**: Archives `TransferApproval`

---

## 6. Multi-Party Authorization

Choices with two controllers (e.g. `PrepareSettlement`, `FinalizeSwap`) require **both** parties to authorize the same transaction. In practice:

- Use a single transaction submitted by a service that holds both credentials, or
- Use a workflow that collects signatures and submits once both are present

---

*Last updated: March 2026.*
