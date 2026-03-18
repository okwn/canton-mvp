/**
 * Mock Ledger API transport for tests.
 * Intercepts fetch to /v2/* and returns fixture responses.
 */

export interface MockLedgerResponse {
  "/v2/version"?: { major?: string; minor?: string };
  "/v2/commands/submit-and-wait"?: { completions: Array<{ commandId: string; status?: { status: string } }> };
  "/v2/commands/submit-and-wait-for-transaction"?: {
    transaction?: { commandId: string; effectiveAt: string; events: unknown[]; offset: string };
  };
}

const DEFAULT_RESPONSES: MockLedgerResponse = {
  "/v2/version": { major: "2", minor: "0" },
  "/v2/commands/submit-and-wait": {
    completions: [{ commandId: "mock-cmd-1", status: { status: "OK" } }],
  },
  "/v2/commands/submit-and-wait-for-transaction": {
    transaction: {
      commandId: "mock-cmd-1",
      effectiveAt: new Date().toISOString(),
      events: [],
      offset: "0",
    },
  },
};

/**
 * Create a fetch mock that responds to Ledger API paths.
 */
export function createMockLedgerFetch(
  responses: MockLedgerResponse = {}
): typeof fetch {
  const merged = { ...DEFAULT_RESPONSES, ...responses };

  return async (input: string | URL | Request, _init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
    const path = new URL(url).pathname;

    for (const [key, value] of Object.entries(merged)) {
      if (path.includes(key) || path.endsWith(key)) {
        return new Response(JSON.stringify(value), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Not mocked" }), { status: 404 });
  };
}
