# Examples

Runnable examples that demonstrate Canton MVP reuse. Each example is a thin client — it calls the API only; all logic lives in the API and its packages.

## Examples

| Example | Description |
|---------|-------------|
| [example-wallet](./example-wallet/) | Wallet session + holdings/balances viewer |
| [example-swap-flow](./example-swap-flow/) | RFQ → respond → accept → deal inspection |
| [example-app-onboarding](./example-app-onboarding/) | User creation → party allocation → wallet connect → holdings |

## Run

```bash
# Start API (from repo root)
pnpm dev:api

# Run example
cd examples/example-wallet
pnpm start
```

See [docs/examples-index.md](../docs/examples-index.md) for full index and architecture notes.
