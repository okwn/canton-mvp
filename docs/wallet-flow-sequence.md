# Wallet Flow Sequences

> Sequence diagrams for dApp-style and wallet-provider flows.

## dApp-style flow (CIP-103 / Wallet Gateway)

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   dApp  │     │ WalletAdapter │     │ Wallet     │     │ Canton       │
│   (UI)  │     │ (DappSdk)     │     │ Gateway    │     │ Ledger       │
└────┬────┘     └──────┬───────┘     └─────┬──────┘     └──────┬───────┘
     │                 │                   │                   │
     │ connect()       │                   │                   │
     │────────────────>│                   │                   │
     │                 │  initiate session │                   │
     │                 │──────────────────>│                   │
     │                 │                   │  allocate party   │
     │                 │                   │──────────────────>│
     │                 │                   │<──────────────────│
     │                 │<──────────────────│                   │
     │<────────────────│ WalletConnection  │                   │
     │                 │                   │                   │
     │ prepareTransaction(cmd)             │                   │
     │────────────────>│                   │                   │
     │                 │  prepare          │                   │
     │                 │──────────────────>│                   │
     │                 │                   │  create command   │
     │                 │                   │──────────────────>│
     │                 │                   │<──────────────────│
     │                 │<──────────────────│ TransactionReview │
     │<────────────────│                   │                   │
     │                 │                   │                   │
     │ requestSigning(review)              │                   │
     │────────────────>│                   │                   │
     │                 │  execute (user    │                   │
     │                 │  signs in wallet) │                   │
     │                 │──────────────────>│                   │
     │                 │                   │  submit signed    │
     │                 │                   │──────────────────>│
     │                 │                   │<──────────────────│
     │                 │<──────────────────│ SigningResult     │
     │<────────────────│                   │                   │
     │                 │                   │                   │
```

**Steps:**

1. **Connect** – dApp calls `connect()`; adapter talks to Wallet Gateway; user approves; session with `partyId` is returned.
2. **Prepare** – dApp calls `prepareTransaction(command)`; Gateway creates command; returns `TransactionReview` for user review.
3. **Execute** – dApp calls `requestSigning(review)`; user signs in wallet; Gateway submits; returns `SigningResult`.

---

## Wallet-provider / Exchange flow (Wallet SDK)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│ Wallet      │     │ WalletAdapter│     │ Wallet SDK  │     │ Canton       │
│ Provider    │     │ (WalletSdk)  │     │ (validator) │     │ Ledger       │
└──────┬──────┘     └──────┬───────┘     └──────┬──────┘     └──────┬───────┘
       │                   │                   │                   │
       │ connect()         │                   │                   │
       │──────────────────>│                   │                   │
       │                   │  connect +       │                   │
       │                   │  allocate party  │                   │
       │                   │──────────────────>│                   │
       │                   │                   │  sync, register   │
       │                   │                   │──────────────────>│
       │                   │                   │<──────────────────│
       │                   │<──────────────────│                   │
       │<──────────────────│ WalletConnection  │                   │
       │                   │                   │                   │
       │ prepareTransaction(cmd)               │                   │
       │──────────────────>│                   │                   │
       │                   │  build command   │                   │
       │                   │──────────────────>│                   │
       │                   │                   │  create command   │
       │                   │                   │──────────────────>│
       │                   │                   │<──────────────────│
       │                   │<──────────────────│ TransactionReview  │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │ requestSigning(review)                │                   │
       │──────────────────>│                   │                   │
       │                   │  sign locally    │                   │
       │                   │  (custodial key) │                   │
       │                   │──────────────────>│                   │
       │                   │                   │  submit signed    │
       │                   │                   │──────────────────>│
       │                   │                   │<──────────────────│
       │                   │<──────────────────│ SigningResult     │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
```

**Steps:**

1. **Connect** – Provider calls `connect()`; adapter uses Wallet SDK to connect and allocate party; returns `WalletConnection`.
2. **Prepare** – Provider calls `prepareTransaction(command)`; SDK builds command; returns `TransactionReview`.
3. **Sign & Submit** – Provider calls `requestSigning(review)`; SDK signs with custodial key and submits; returns `SigningResult`.

---

## Mock flow (local development)

```
┌─────────┐     ┌──────────────┐
│   App   │     │ MockWallet   │
│   (UI)  │     │ Adapter      │
└────┬────┘     └──────┬───────┘
     │                 │
     │ connect()       │
     │────────────────>│
     │                 │  in-memory session
     │<────────────────│ WalletConnection
     │                 │
     │ prepareTransaction(cmd)
     │────────────────>│
     │<────────────────│ TransactionReview (mock)
     │                 │
     │ requestSigning(review)
     │────────────────>│
     │                 │  simulate success
     │<────────────────│ SigningResult
     │                 │
```

**Steps:**

1. **Connect** – Returns a mock session with configurable `partyId` / `userId`.
2. **Prepare** – Returns a mock `TransactionReview` with generated `commandId`.
3. **Sign** – Simulates success and returns mock `SigningResult` with `transactionId`.

---

## Event flow (UI state)

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐
│   UI    │     │ WalletAdapter│     │ Provider    │
│  Hooks  │     │ (events)     │     │ (external)  │
└────┬────┘     └──────┬───────┘     └──────┬──────┘
     │                 │                   │
     │ useWalletEvents │                   │
     │ ("connect", fn) │                   │
     │────────────────>│                   │
     │                 │                   │
     │                 │   connect()       │
     │                 │<──────────────────│
     │                 │                   │
     │                 │ emit("connect")   │
     │                 │──────────────────>│
     │<────────────────│                   │
     │  handler runs   │                   │
     │                 │                   │
     │ useWalletEvents │                   │
     │ ("signingRequested", fn)            │
     │────────────────>│                   │
     │                 │                   │
     │                 │ prepareTransaction│
     │                 │<──────────────────│
     │                 │ emit("signingRequested")
     │                 │──────────────────>│
     │<────────────────│                   │
     │  show review UI │                   │
```

Hooks subscribe to adapter events; the adapter emits when the provider reports state changes. The UI updates without polling.
