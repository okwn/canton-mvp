#!/usr/bin/env tsx
/**
 * Example: RFQ to settlement demo flow
 *
 * Walks through: request quote → respond → accept → inspect deal.
 * Uses Canton MVP API only. Proves swap-engine is reusable via API.
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

const DSO = "DSO::1220" + "b".repeat(64);
const MOCK = "MOCK::1220" + "a".repeat(64);

async function main() {
  console.log("=== Example: RFQ to settlement flow ===\n");

  // Create two users (requester + counterparty)
  const requesterRes = await api<{ userId: string }>("/auth/login", {
    body: { externalId: "swap-requester", email: "requester@example.com" },
  });
  const counterpartyRes = await api<{ userId: string }>("/auth/login", {
    body: { externalId: "swap-counterparty", email: "counterparty@example.com" },
  });
  const requesterToken = requesterRes.userId;
  const counterpartyToken = counterpartyRes.userId;

  // Use party IDs from mock (normally from allocate)
  const requesterParty = "requester::1220" + "a".repeat(64);
  const counterpartyParty = "counterparty::1220" + "b".repeat(64);

  // 1. Request quote (requester)
  const requestRes = await api<{ id: string; requester: string; counterparty: string }>("/swaps/quotes", {
    token: requesterToken,
    body: {
      requester: requesterParty,
      counterparty: counterpartyParty,
      giveInstrument: { admin: DSO, symbol: "USD" },
      giveAmount: "100",
      receiveInstrument: { admin: DSO, symbol: "EUR" },
      receiveAmount: "95",
    },
  });
  const requestId = requestRes.id;
  console.log("1. Quote requested:", requestId);

  // 2. Respond to quote (counterparty)
  const respondRes = await api<{ id: string; requestId: string }>("/swaps/quotes/respond", {
    token: counterpartyToken,
    body: {
      requestId,
      counterparty: counterpartyParty,
      giveInstrument: { admin: DSO, symbol: "EUR" },
      giveAmount: "95",
      receiveInstrument: { admin: DSO, symbol: "USD" },
      receiveAmount: "100",
    },
  });
  const responseId = respondRes.id;
  console.log("2. Quote responded:", responseId);

  // 3. Accept quote (requester)
  const acceptRes = await api<{ decision: unknown; deal: { id: string; state: string } }>(
    "/swaps/quotes/accept",
    {
      token: requesterToken,
      body: { responseId, decidedBy: requesterParty },
    }
  );
  const dealId = acceptRes.deal.id;
  console.log("3. Quote accepted. Deal:", dealId, "state:", acceptRes.deal.state);

  // 4. Inspect deal
  const deal = await api<{
    id: string;
    state: string;
    giveLeg: { party: string; instrumentId: { admin: string; symbol: string }; amount: string };
    receiveLeg: { party: string; instrumentId: { admin: string; symbol: string }; amount: string };
  }>(`/swaps/deals/${dealId}`, { token: requesterToken });
  console.log("\n4. Deal detail:");
  console.log("   Give:", deal.giveLeg.amount, deal.giveLeg.instrumentId.symbol, "from", deal.giveLeg.party.slice(0, 20) + "...");
  console.log("   Receive:", deal.receiveLeg.amount, deal.receiveLeg.instrumentId.symbol, "from", deal.receiveLeg.party.slice(0, 20) + "...");
  console.log("   State:", deal.state);

  console.log("\nDone. Full settlement would require ledger submission (not in scope for this demo).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
