#!/usr/bin/env bash
# Canton MVP — Validate required services for Quickstart overlay mode
#
# Checks that Ledger API, Validator API, and Scan API are reachable.
# Usage:
#   ./integrations/quickstart-overlay/scripts/validate-services.sh
#
# Exit codes:
#   0 — all required services OK
#   1 — one or more services failed

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OVERLAY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$OVERLAY_DIR/../.." && pwd)"

# Load .env if present
if [[ -f "$REPO_ROOT/.env" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$REPO_ROOT/.env"
  set +a
fi

LEDGER_URL="${LEDGER_API_URL:-http://canton.localhost:3975}"
VALIDATOR_URL="${VALIDATOR_API_URL:-http://canton.localhost:3903}"
SCAN_URL="${SCAN_API_URL:-http://scan.localhost:4000}"

FAILED=0

check() {
  local name="$1"
  local url="$2"
  local path="${3:-/}"

  if curl -sf --max-time 5 "${url}${path}" >/dev/null 2>&1; then
    echo "[OK] $name ($url)"
    return 0
  else
    echo "[FAIL] $name ($url) — not reachable"
    return 1
  fi
}

echo "[canton-mvp] Validating Quickstart overlay services"
echo ""

# JSON Ledger API v2
if ! check "Ledger API" "$LEDGER_URL" "/v2/version"; then
  FAILED=1
fi

# Validator API (may require auth; we only check connectivity)
if ! check "Validator API" "$VALIDATOR_URL" "/api/validator/v0/validator-user"; then
  FAILED=1
fi

# Scan API (optional; may not be running in minimal setup)
if ! check "Scan API" "$SCAN_URL" "/api/scan/v0/scans"; then
  echo "  (Scan is optional; continue if not using Scan)"
fi

echo ""
if [[ $FAILED -eq 0 ]]; then
  echo "All required services OK."
  exit 0
else
  echo "One or more required services failed. Ensure cn-quickstart LocalNet is running."
  exit 1
fi
