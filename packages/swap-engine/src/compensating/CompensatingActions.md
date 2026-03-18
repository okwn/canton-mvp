# Compensating Action Strategy Notes

When a deal fails or is cancelled at various stages, these compensating actions should be considered.

## Quote Requested

**State:** `quote_requested`

**Compensation:** None required. No ledger state has been created. Simply stop the workflow and optionally notify the counterparty.

---

## Quote Responded

**State:** `quote_responded`

**Compensation:** None required. The response is an offer; no ledger commitment. If the requester cancels, discard the response. If the quote expires, mark as expired.

---

## Accepted

**State:** `accepted`

**Compensation:** No ledger submission has occurred yet. If pre-settlement checks fail or the deal is cancelled:
- Revoke any preapprovals that may have been requested (if your token implementation supports it)
- Clear any cached approval state
- No ledger rollback needed

---

## Pre-Settlement Checks Failed

**State:** Transition to `cancelled`

**Compensation:**
- If balance checks failed: no action (insufficient balance prevented any commitment)
- If approval checks failed: revoke or release any held preapprovals
- If compliance checks failed: log for audit; no ledger state to unwind

---

## Approvals Pending

**State:** `approvals_pending`

**Compensation:**
- If deal is cancelled before settlement: release any preapprovals or transfer intents that were created
- Canton CIP-0056 preapprovals: use the appropriate revocation flow if supported
- Do not submit the settlement instruction

---

## Settlement Ready

**State:** `settlement_ready`

**Compensation:**
- If cancelled before submission: same as approvals_pending
- If submission fails (network error, ledger rejection): retry with idempotency, or mark deal as failed and trigger manual review
- Do not partially submit legs; settlement is atomic or not at all

---

## Settlement Submitted (Awaiting Confirmation)

**State:** Still `settlement_ready` until `settlement_confirmed`

**Compensation:**
- If ledger reports failure: transition to `cancelled`, log for investigation
- If ledger reports success: transition to `settled`; no compensation
- If timeout before confirmation: implement reconciliation job to check ledger state; do not assume failure

---

## General Principles

1. **No partial settlement:** Never submit one leg without the other in a bilateral exchange. Use atomic settlement or abort.

2. **Idempotency:** Settlement submission should be idempotent (same commandId, same payload) to allow safe retries.

3. **Reconciliation:** For deals stuck in `settlement_ready`, run a reconciliation process against the ledger to determine actual state.

4. **Audit trail:** Emit events for all state transitions and compensating actions to support audit and debugging.
