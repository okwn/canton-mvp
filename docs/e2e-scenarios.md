# E2E Scenarios

End-to-end test scenarios for Canton MVP.

## Happy Path (Implemented)

**File**: `apps/api/src/e2e/happy-path.test.ts`

**Flow**:
1. **Onboarding** — Login → allocate party
2. **Wallet connect** — Connect → fetch holdings
3. **Quote request** — User A requests, User B responds
4. **Accept** — User A accepts → deal created
5. **Settlement prep** — Deal has giveLeg/receiveLeg for settlement

**Validates**: Full architecture from auth through swap-engine. No external services (Canton, wallet gateway).

## Scenario Matrix

| Scenario | Onboarding | Wallet | Quote | Accept | Settlement |
|----------|------------|--------|-------|--------|------------|
| Happy path | ✅ | ✅ | ✅ | ✅ | Prep only |
| Reject quote | ✅ | — | ✅ | Reject | — |
| Cancel deal | ✅ | — | ✅ | ✅ | Cancel |
| Multi-party swap | ✅ | ✅ | ✅ | ✅ | — |

## Extending E2E

### Browser E2E (Playwright)

To add browser E2E for the web app:

1. Add Playwright to `apps/web`
2. Start API + web in `beforeAll`
3. Navigate to `/connect`, login, `/dashboard`, `/wallet`, `/swaps/new`
4. Assert UI state at each step

### Ledger E2E

For full settlement (ledger submission):

1. Run Canton (e.g. daml sandbox or Canton participant)
2. Use real ValidatorClient, CantonLedgerClient
3. Create deal → createSettlementInstruction → submit to ledger
4. Assert deal state = settled

This requires a running Canton environment and is typically run in a separate CI job or manually.
