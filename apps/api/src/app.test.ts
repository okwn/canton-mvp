import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "./app.js";

describe("API", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("GET /health returns ok", async () => {
    const res = await app.inject({ method: "GET", path: "/health" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("canton-mvp-api");
  });

  it("GET /health/ready returns ready", async () => {
    const res = await app.inject({ method: "GET", path: "/health/ready" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe("ready");
  });

  it("POST /api/v1/auth/login creates user", async () => {
    const res = await app.inject({
      method: "POST",
      path: "/api/v1/auth/login",
      payload: { email: "test@example.com", externalId: "test-ext-1" },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.userId).toBeDefined();
  });
});
