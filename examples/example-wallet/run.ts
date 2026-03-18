#!/usr/bin/env tsx
/**
 * Example: Wallet-backed asset viewer
 *
 * Uses Canton MVP API only. No direct package imports except shared-types for types.
 * Proves: API is the contract; wallet + tokens endpoints are reusable.
 */

const API_BASE = process.env["API_URL"] ?? "http://localhost:8080/api/v1";

async function api<T>(path: string, opts?: { token?: string; body?: unknown; method?: string }): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts?.token) headers["Authorization"] = `Bearer ${opts.token}`;
  const init: RequestInit = { headers };
  if (opts?.body) {
    init.method = opts.method ?? "POST";
    init.body = JSON.stringify(opts.body);
  } else if (opts?.method) init.method = opts.method;
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function main() {
  console.log("=== Example: Wallet-backed asset viewer ===\n");

  // 1. Login (get token)
  const loginRes = await api<{ userId: string }>("/auth/login", {
    body: { externalId: "example-wallet-user", email: "wallet@example.com" },
  });
  const token = loginRes.userId;
  console.log("Logged in:", loginRes.userId);

  // 2. Connect wallet (uses wallet provider via API)
  const connectRes = await api<{ session: { partyId: string }; connectedAt: number }>("/wallet/connect", {
    method: "POST",
    body: {},
    token,
  });
  const partyId = connectRes.session.partyId;
  console.log("Wallet connected. Party:", partyId.slice(0, 30) + "...");

  // 3. Fetch holdings (API uses @canton-mvp/token-standard + wallet provider)
  const holdings = await api<
    Array<{ instrumentId: { admin: string; symbol: string }; amount: string; contractId?: string }>
  >(`/tokens/holdings/${partyId}`, { token });
  console.log("\nHoldings:");
  for (const h of holdings) {
    console.log(`  ${h.instrumentId.admin.slice(0, 12)}...::${h.instrumentId.symbol}: ${h.amount}`);
  }

  // 4. Fetch balances (aggregated via token-standard)
  const balances = await api<
    Array<{ instrumentId: { admin: string; symbol: string }; amount: string; totalHoldings?: number }>
  >(`/tokens/balances/${partyId}`, { token });
  console.log("\nBalances:");
  for (const b of balances) {
    console.log(`  ${b.instrumentId.symbol}: ${b.amount} (${b.totalHoldings ?? 0} holdings)`);
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
