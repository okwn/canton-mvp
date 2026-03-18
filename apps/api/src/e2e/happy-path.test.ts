/**
 * E2E happy path: onboarding → wallet connect → quote request → accept → settlement prep.
 * Single scenario validating the full architecture.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app.js";

const API = "/api/v1";

describe("E2E happy path", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  async function req(
    method: string,
    path: string,
    opts?: { body?: unknown; token?: string }
  ) {
    const res = await app.inject({
      method,
      url: `${API}${path}`,
      payload: opts?.body,
      headers: opts?.token ? { authorization: `Bearer ${opts.token}` } : {},
    });
    return { status: res.statusCode, json: () => res.json() };
  }

  it("onboarding → wallet → quote → accept → settlement prep", async () => {
    // 1. Onboarding
    const login = await req("POST", "/auth/login", {
      body: { externalId: "e2e-user", email: "e2e@test.com" },
    });
    expect(login.status).toBe(200);
    const token = (login.json() as { userId: string }).userId;

    const alloc = await req("POST", `/parties/users/${token}/allocate`, {
      body: { partyId: "e2e-party::1220" + "e".repeat(64), source: "manual" },
      token,
    });
    expect(alloc.status).toBe(201);

    // 2. Wallet connect
    const connect = await req("POST", "/wallet/connect", { token });
    expect(connect.status).toBe(200);
    const sessionParty = (connect.json() as { session: { partyId: string } }).session.partyId;

    const holdings = await req("GET", `/tokens/holdings/${sessionParty}`, { token });
    expect(holdings.status).toBe(200);

    // 3. Quote request (two users)
    const tokenA = (await req("POST", "/auth/login", { body: { externalId: "e2e-a" } })).json() as { userId: string };
    const tokenB = (await req("POST", "/auth/login", { body: { externalId: "e2e-b" } })).json() as { userId: string };
    const partyA = "e2e-a::1220" + "a".repeat(64);
    const partyB = "e2e-b::1220" + "b".repeat(64);
    const dso = "DSO::1220" + "c".repeat(64);

    const quoteReq = await req("POST", "/swaps/quotes", {
      token: tokenA.userId,
      body: {
        requester: partyA,
        counterparty: partyB,
        giveInstrument: { admin: dso, symbol: "USD" },
        giveAmount: "100",
        receiveInstrument: { admin: dso, symbol: "EUR" },
        receiveAmount: "90",
      },
    });
    expect(quoteReq.status).toBe(201);
    const requestId = (quoteReq.json() as { id: string }).id;

    const quoteResp = await req("POST", "/swaps/quotes/respond", {
      token: tokenB.userId,
      body: {
        requestId,
        counterparty: partyB,
        giveInstrument: { admin: dso, symbol: "EUR" },
        giveAmount: "90",
        receiveInstrument: { admin: dso, symbol: "USD" },
        receiveAmount: "100",
      },
    });
    expect(quoteResp.status).toBe(201);
    const responseId = (quoteResp.json() as { id: string }).id;

    // 4. Accept
    const accept = await req("POST", "/swaps/quotes/accept", {
      token: tokenA.userId,
      body: { responseId, decidedBy: partyA },
    });
    expect(accept.status).toBe(200);
    const deal = (accept.json() as { deal: { id: string; state: string; giveLeg: unknown; receiveLeg: unknown } }).deal;
    expect(deal.state).toBe("accepted");
    expect(deal.giveLeg).toBeDefined();
    expect(deal.receiveLeg).toBeDefined();

    // 5. Settlement preparation (deal has legs; swap-engine can create instruction)
    const dealGet = await req("GET", `/swaps/deals/${deal.id}`, { token: tokenA.userId });
    expect(dealGet.status).toBe(200);
    const fetched = dealGet.json() as { giveLeg: { amount: string }; receiveLeg: { amount: string } };
    expect(fetched.giveLeg.amount).toBe("100");
    expect(fetched.receiveLeg.amount).toBe("90");
  });
});
