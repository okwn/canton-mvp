# Wallet Layer

> Provider-agnostic wallet integration for Canton MVP. Apps depend only on this abstraction; vendor and protocol complexity are hidden.

## Overview

The `@canton-mvp/wallet-adapter` package provides:

- **Interfaces** – provider-agnostic types for sessions, connections, signing, and holdings
- **Adapters** – implementations for dApp SDK (CIP-103), Wallet SDK, and a mock provider
- **Hooks** – React hooks for connection state, session, and event subscriptions
- **Events** – lifecycle events for UI state (connect, disconnect, signing, etc.)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         App / UI Layer                           │
│  (uses only wallet-adapter interfaces, hooks, and adapters)      │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    @canton-mvp/wallet-adapter                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Interfaces  │  │   Adapters  │  │ Hooks + EventEmitter    │  │
│  │ (provider,  │  │ MockWallet  │  │ useWalletConnection,    │  │
│  │  events)    │  │ DappSdk     │  │ useWalletSession,       │  │
│  │             │  │ WalletSdk   │  │ useWalletEvents         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ Mock (in-memory)│    │ dApp SDK (CIP-103)  │    │ Wallet SDK          │
│ Local dev       │    │ Wallet Gateway      │    │ Wallet providers    │
└─────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## Integration Styles

### 1. dApp-style (CIP-103)

- **Flow**: Connect → Prepare transaction → User reviews → Execute
- **Adapter**: `DappSdkAdapter`
- **Use case**: Web dApps connecting to user wallets via Wallet Gateway

### 2. Wallet-provider / Exchange-style

- **Flow**: Direct connect, allocate party, sign, submit
- **Adapter**: `WalletSdkAdapter`
- **Use case**: Custodial wallets, exchanges, backend services

### 3. Local development

- **Flow**: In-memory mock, no external services
- **Adapter**: `MockWalletAdapter`
- **Use case**: Local dev, tests, demos

## Interfaces

### IWalletProvider

```ts
interface IWalletProvider {
  readonly id: string;
  readonly name: string;
  readonly events?: IWalletEventEmitter;

  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  getSession(): Promise<WalletSession | null>;
  detectSession(): Promise<WalletSession | null>;

  prepareTransaction(command: unknown): Promise<TransactionReview>;
  requestSigning(review: TransactionReview): Promise<SigningResult>;
  submitSignedTransaction(commandId: string, signedPayload: unknown): Promise<SigningResult>;

  getHoldings(partyId: PartyId): Promise<WalletHolding[]>;
}
```

### Types

| Type | Description |
|------|-------------|
| `WalletSession` | `partyId`, `userId?`, `networkId?` |
| `WalletConnection` | `session`, `connectedAt` |
| `TransactionReview` | `commandId`, `summary?`, `payload?` |
| `SigningResult` | `commandId`, `success`, `transactionId?`, `error?` |
| `WalletHolding` | `instrumentId`, `amount`, `contractId?` |

## Events

| Event | Payload |
|-------|---------|
| `connect` | `{ connection: WalletConnection }` |
| `disconnect` | `{ session: WalletSession \| null }` |
| `sessionChange` | `{ session: WalletSession \| null }` |
| `signingRequested` | `{ review: TransactionReview }` |
| `signingCompleted` | `{ result: SigningResult }` |
| `transactionSubmitted` | `{ result: SigningResult }` |
| `error` | `{ error: Error }` |

## Usage

### Setup with Mock (local dev)

```tsx
import { WalletProvider, MockWalletAdapter } from "@canton-mvp/wallet-adapter";

const mockProvider = new MockWalletAdapter({
  defaultPartyId: "party::1220...",
  defaultUserId: "user-1",
  simulateDelayMs: 100,
});

function App() {
  return (
    <WalletProvider provider={mockProvider}>
      <YourApp />
    </WalletProvider>
  );
}
```

### Connection and session

```tsx
import { useWalletConnection, useWalletSession } from "@canton-mvp/wallet-adapter";

function WalletButton() {
  const { connection, isConnecting, connect, disconnect } = useWalletConnection();
  const { session } = useWalletSession();

  if (connection) {
    return (
      <button onClick={disconnect}>
        Disconnect {session?.partyId}
      </button>
    );
  }
  return (
    <button onClick={connect} disabled={isConnecting}>
      {isConnecting ? "Connecting..." : "Connect"}
    </button>
  );
}
```

### Event subscription

```tsx
import { useWalletEvents } from "@canton-mvp/wallet-adapter";

function SigningIndicator() {
  const [review, setReview] = useState(null);
  useWalletEvents("signingRequested", ({ review }) => setReview(review));
  useWalletEvents("signingCompleted", () => setReview(null));

  if (!review) return null;
  return <div>Please sign: {review.summary}</div>;
}
```

### Transaction flow

```tsx
const provider = useWalletProvider();

// 1. Prepare
const review = await provider.prepareTransaction(command);

// 2. Request signing (user approves in wallet)
const result = await provider.requestSigning(review);

// 3. Or submit pre-signed payload
const result = await provider.submitSignedTransaction(commandId, signedPayload);
```

## Package structure

```
packages/wallet-adapter/src/
├── interfaces/
│   ├── provider.ts   # IWalletProvider, WalletSession, etc.
│   ├── events.ts     # WalletEventType, IWalletEventEmitter
│   └── index.ts
├── adapters/
│   ├── MockWalletAdapter.ts
│   ├── DappSdkAdapter.ts
│   ├── WalletSdkAdapter.ts
│   └── index.ts
├── events/
│   ├── WalletEventEmitter.ts
│   └── index.ts
├── hooks/
│   ├── WalletProvider.tsx
│   ├── WalletProviderContext.tsx
│   ├── useWalletConnection.ts
│   ├── useWalletSession.ts
│   ├── useWalletEvents.ts
│   └── index.ts
└── index.ts
```

## Dependencies

- `@canton-mvp/shared-types` – `PartyId`, `WalletHolding`
- `react` (peer) – for hooks

## See also

- [wallet-flow-sequence.md](./wallet-flow-sequence.md) – sequence diagrams for dApp vs wallet-provider flows
