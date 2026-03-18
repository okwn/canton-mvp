#!/usr/bin/env tsx
/**
 * Example: App onboarding flow
 *
 * Create user → allocate party → connect wallet → inspect holdings.
 * Uses Canton MVP API only. Proves party-identity, wallet-adapter, token-standard via API.
 */

const API_BASE = process.env["API_URL"] ?? "http://localhost:8080/api/v1";

async function api<T>(path: string, opts?: { token?: string; body?: unknown; method?: string }): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts?.token) headers["Authorization"] = `Bearer ${opts.token}`;
  const init: RequestInit = { headers };
  if (opts?.body !== undefined) {
    init.method = opts.method ?? "POST";
    init.body = JSON.stringify(opts.body);
  } else if (opts?.method) init.method = opts.method;
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function main() {
  console.log("=== Example: App onboarding ===\n");

  // 1. Create user (login)
  const loginRes = await api<{ userId: string }>("/auth/login", {
    body: { externalId: "onboarding-user-1", email: "user@example.com" },
  });
  const userId = loginRes.userId;
  const token = userId;
  console.log("1. User created:", userId);

  // 2. Allocate party (link party to user via party-identity)
  const partyId = "alice::1220" + "a".repeat(64);
  const partyRes = await api<{ partyId: string; userId: string; source: string }>(
    `/parties/users/${userId}/allocate`,
    {
      token,
      body: { partyId, source: "manual", displayName: "Alice" },
    }
  );
  console.log("2. Party allocated:", partyRes.partyId.slice(0, 24) + "...", "source:", partyRes.source);

  // 3. List parties
  const parties = await api<Array<{ partyId: string; userId: string; source: string }>>(
    `/parties/users/${userId}`,
    { token }
  );
  console.log("   Parties for user:", parties.length);

  // 4. Get primary party
  const primaryRes = await api<{ partyId: string; userId: string }>(
    `/parties/users/${userId}/primary`,
    { token }
  );
  console.log("3. Primary party:", primaryRes.partyId.slice(0, 24) + "...");

  // 5. Connect wallet (wallet-adapter)
  const connectRes = await api<{ session: { partyId: string }; connectedAt: number }>("/wallet/connect", {
    method: "POST",
    body: {},
    token,
  });
  const walletPartyId = connectRes.session.partyId;
  console.log("4. Wallet connected. Session party:", walletPartyId.slice(0, 24) + "...");

  // 6. Inspect holdings (token-standard + wallet provider)
  const holdings = await api<
    Array<{ instrumentId: { admin: string; symbol: string }; amount: string }>
  >(`/tokens/holdings/${walletPartyId}`, { token });
  console.log("\n5. Holdings (wallet session):");
  for (const h of holdings) {
    console.log(`   ${h.instrumentId.symbol}: ${h.amount}`);
  }

  // 7. Inspect balances (aggregated)
  const balances = await api<
    Array<{ instrumentId: { admin: string; symbol: string }; amount: string; totalHoldings?: number }>
  >(`/tokens/balances/${walletPartyId}`, { token });
  console.log("\n6. Balances:");
  for (const b of balances) {
    console.log(`   ${b.instrumentId.symbol}: ${b.amount}`);
  }

  console.log("\nDone. Onboarding complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
