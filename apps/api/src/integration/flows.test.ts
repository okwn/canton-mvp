/**
 * Integration tests for API flows.
 * Validates architecture boundaries: auth → parties → wallet → tokens → swaps.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app.js";

describe("API integration flows", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  function inject(
    method: string,
    path: string,
    opts?: { payload?: unknown; token?: string }
  ) {
    return app.inject({
      method,
      url: path,
      payload: opts?.payload,
      headers: opts?.token ? { authorization: `Bearer ${opts.token}` } : {},
    });
  }

  describe("onboarding flow", () => {
    it("login → allocate party → primary party", async () => {
      const loginRes = await inject("POST", "/api/v1/auth/login", {
        payload: { externalId: "flow-user-1", email: "flow@test.com" },
      });
      expect(loginRes.statusCode).toBe(200);
      const token = (loginRes.json() as { userId: string }).userId;
      const partyId = "flow-party::1220" + "a".repeat(64);

      const allocRes = await inject("POST", `/api/v1/parties/users/${token}/allocate`, {
        token,
        payload: { partyId, source: "manual", displayName: "Flow User" },
      });
      expect(allocRes.statusCode).toBe(201);

      const primaryRes = await inject("GET", `/api/v1/parties/users/${token}/primary`, { token });
      expect(primaryRes.statusCode).toBe(200);
      expect((primaryRes.json() as { partyId: string }).partyId).toBe(partyId);
    });
  });

  describe("wallet connect flow", () => {
    it("connect → session → holdings", async () => {
      const loginRes = await inject("POST", "/api/v1/auth/login", {
        payload: { externalId: "wallet-flow-user", email: "wf@test.com" },
      });
      const token = (loginRes.json() as { userId: string }).userId;

      const connectRes = await inject("POST", "/api/v1/wallet/connect", { token });
      expect(connectRes.statusCode).toBe(200);
      const { session } = connectRes.json() as { session: { partyId: string } };
      expect(session.partyId).toBeDefined();

      const sessionRes = await inject("GET", "/api/v1/wallet/session", { token });
      expect(sessionRes.statusCode).toBe(200);
      expect((sessionRes.json() as { session: { partyId: string } }).session).toBeDefined();

      const holdingsRes = await inject("GET", `/api/v1/tokens/holdings/${session.partyId}`, { token });
      expect(holdingsRes.statusCode).toBe(200);
      const holdings = holdingsRes.json() as Array<{ instrumentId: { symbol: string }; amount: string }>;
      expect(Array.isArray(holdings)).toBe(true);
    });
  });

  describe("quote request flow", () => {
    it("request → respond → accept → deal", async () => {
      const requesterRes = await inject("POST", "/api/v1/auth/login", {
        payload: { externalId: "quote-requester", email: "r@test.com" },
      });
      const requesterToken = (requesterRes.json() as { userId: string }).userId;

      const counterpartyRes = await inject("POST", "/api/v1/auth/login", {
        payload: { externalId: "quote-counterparty", email: "c@test.com" },
      });
      const counterpartyToken = (counterpartyRes.json() as { userId: string }).userId;

      const reqParty = "requester::1220" + "r".repeat(64);
      const cpyParty = "counterparty::1220" + "c".repeat(64);
      const dso = "DSO::1220" + "b".repeat(64);

      const requestRes = await app.inject({
        method: "POST",
        url: "/api/v1/swaps/quotes",
        payload: {
          requester: reqParty,
          counterparty: cpyParty,
          giveInstrument: { admin: dso, symbol: "USD" },
          giveAmount: "100",
          receiveInstrument: { admin: dso, symbol: "EUR" },
          receiveAmount: "95",
        },
        headers: { authorization: `Bearer ${requesterToken}` },
      });
      expect(requestRes.statusCode).toBe(201);
      const request = requestRes.json() as { id: string };
      const requestId = request.id;

      const respondRes = await app.inject({
        method: "POST",
        url: "/api/v1/swaps/quotes/respond",
        payload: {
          requestId,
          counterparty: cpyParty,
          giveInstrument: { admin: dso, symbol: "EUR" },
          giveAmount: "95",
          receiveInstrument: { admin: dso, symbol: "USD" },
          receiveAmount: "100",
        },
        headers: { authorization: `Bearer ${counterpartyToken}` },
      });
      expect(respondRes.statusCode).toBe(201);
      const response = respondRes.json() as { id: string };
      const responseId = response.id;

      const acceptRes = await app.inject({
        method: "POST",
        url: "/api/v1/swaps/quotes/accept",
        payload: { responseId, decidedBy: reqParty },
        headers: { authorization: `Bearer ${requesterToken}` },
      });
      expect(acceptRes.statusCode).toBe(200);
      const { deal } = acceptRes.json() as { deal: { id: string; state: string } };
      expect(deal.state).toBe("accepted");

      const dealRes = await app.inject({
        method: "GET",
        url: `/api/v1/swaps/deals/${deal.id}`,
        headers: { authorization: `Bearer ${requesterToken}` },
      });
      expect(dealRes.statusCode).toBe(200);
      expect((dealRes.json() as { state: string }).state).toBe("accepted");
    });
  });

  describe("settlement preparation", () => {
    it("deal has giveLeg and receiveLeg for settlement", async () => {
      const loginRes = await inject("POST", "/api/v1/auth/login", {
        payload: { externalId: "settlement-user", email: "s@test.com" },
      });
      const t = (loginRes.json() as { userId: string }).userId;
      const reqParty = "settle-req::1220" + "1".repeat(64);
      const cpyParty = "settle-cpy::1220" + "2".repeat(64);
      const dso = "DSO::1220" + "b".repeat(64);

      const reqRes = await app.inject({
        method: "POST",
        url: "/api/v1/swaps/quotes",
        payload: {
          requester: reqParty,
          counterparty: cpyParty,
          giveInstrument: { admin: dso, symbol: "USD" },
          giveAmount: "50",
          receiveInstrument: { admin: dso, symbol: "EUR" },
          receiveAmount: "47",
        },
        headers: { authorization: `Bearer ${t}` },
      });
      const requestId = (reqRes.json() as { id: string }).id;

      const respondRes = await app.inject({
        method: "POST",
        url: "/api/v1/swaps/quotes/respond",
        payload: {
          requestId,
          counterparty: cpyParty,
          giveInstrument: { admin: dso, symbol: "EUR" },
          giveAmount: "47",
          receiveInstrument: { admin: dso, symbol: "USD" },
          receiveAmount: "50",
        },
        headers: { authorization: `Bearer ${t}` },
      });
      const responseId = (respondRes.json() as { id: string }).id;

      const acceptRes = await app.inject({
        method: "POST",
        url: "/api/v1/swaps/quotes/accept",
        payload: { responseId, decidedBy: reqParty },
        headers: { authorization: `Bearer ${t}` },
      });
      expect(acceptRes.statusCode).toBe(200);

      const { deal } = acceptRes.json() as { deal: { id: string; giveLeg: unknown; receiveLeg: unknown } };
      expect(deal.giveLeg).toBeDefined();
      expect(deal.receiveLeg).toBeDefined();
    });
  });
});
