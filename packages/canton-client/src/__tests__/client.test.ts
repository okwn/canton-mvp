import { describe, it, expect, vi, beforeEach } from "vitest";
import { CantonLedgerClient } from "../client.js";
import {
  createCommand,
  exerciseCommand,
  createAndExerciseCommand,
  buildCommands,
  generateCommandId,
  templateId,
} from "../commands.js";
import { CantonClientError, CantonTimeoutError } from "../errors.js";

const MOCK_BASE = "http://ledger.test";

describe("CantonLedgerClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getVersion", () => {
    it("returns version from /v2/version", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ version: "3.4.0" }),
        })
      );

      const client = new CantonLedgerClient({ baseUrl: MOCK_BASE });
      const result = await client.getVersion();

      expect(result.version).toBe("3.4.0");
      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_BASE}/v2/version`,
        expect.objectContaining({
          method: "GET",
          headers: expect.any(Headers),
        })
      );
    });

    it("includes auth header when authToken provided", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ version: "3.4.0" }),
        })
      );

      const client = new CantonLedgerClient({
        baseUrl: MOCK_BASE,
        authToken: "secret-token",
      });
      await client.getVersion();

      const headers = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe("Bearer secret-token");
    });
  });

  describe("submitAndWait", () => {
    it("posts commands and returns completions", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              completions: [{ commandId: "cmd-1", updateId: "upd-1" }],
            }),
        })
      );

      const client = new CantonLedgerClient({ baseUrl: MOCK_BASE });
      const commands = buildCommands({
        commandId: "cmd-1",
        commands: [createCommand("Main:Asset", { owner: "Alice", name: "x" })],
        actAs: ["Alice"],
      });

      const result = await client.submitAndWait(commands);

      expect(result.completions).toHaveLength(1);
      expect(result.completions[0]?.commandId).toBe("cmd-1");
      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_BASE}/v2/commands/submit-and-wait`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(commands),
        })
      );
    });
  });

  describe("fromConfig", () => {
    it("creates client from CantonConfig", () => {
      const client = CantonLedgerClient.fromConfig(
        { ledgerApiUrl: "http://canton:2975" },
        "token"
      );
      expect(client).toBeInstanceOf(CantonLedgerClient);
    });
  });
});

describe("command builders", () => {
  it("createCommand builds CreateCommand", () => {
    const cmd = createCommand("Main:Asset", { owner: "Alice", name: "x" });
    expect(cmd).toEqual({
      CreateCommand: {
        templateId: "Main:Asset",
        createArguments: { owner: "Alice", name: "x" },
      },
    });
  });

  it("exerciseCommand builds ExerciseCommand", () => {
    const cmd = exerciseCommand("Main:Asset", "cid-123", "Transfer", { newOwner: "Bob" });
    expect(cmd).toEqual({
      ExerciseCommand: {
        templateId: "Main:Asset",
        contractId: "cid-123",
        choice: "Transfer",
        choiceArgument: { newOwner: "Bob" },
      },
    });
  });

  it("createAndExerciseCommand builds CreateAndExerciseCommand", () => {
    const cmd = createAndExerciseCommand(
      "Main:Asset",
      { owner: "Alice", name: "x" },
      "Transfer",
      { newOwner: "Bob" }
    );
    expect(cmd).toEqual({
      CreateAndExerciseCommand: {
        templateId: "Main:Asset",
        createArguments: { owner: "Alice", name: "x" },
        choice: "Transfer",
        choiceArgument: { newOwner: "Bob" },
      },
    });
  });

  it("buildCommands builds JsCommands", () => {
    const cmd = createCommand("Main:Asset", {});
    const js = buildCommands({
      commandId: "id-1",
      commands: [cmd],
      actAs: ["Alice"],
    });
    expect(js.commandId).toBe("id-1");
    expect(js.commands).toHaveLength(1);
    expect(js.actAs).toEqual(["Alice"]);
  });

  it("generateCommandId returns UUID string", () => {
    const id = generateCommandId();
    expect(typeof id).toBe("string");
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("templateId formats without packageId", () => {
    expect(templateId("Main", "Asset")).toBe("Main:Asset");
  });

  it("templateId formats with packageId", () => {
    expect(templateId("Main", "Asset", "pkg-123")).toBe("pkg-123:Main:Asset");
  });
});

describe("CantonClientError", () => {
  it("fromPayload creates error from JsCantonError", () => {
    const err = CantonClientError.fromPayload(
      { code: "INVALID_ARGUMENT", cause: "Bad request" },
      400
    );
    expect(err).toBeInstanceOf(CantonClientError);
    expect(err.code).toBe("INVALID_ARGUMENT");
    expect(err.cause).toBe("Bad request");
    expect(err.statusCode).toBe(400);
  });

  it("fromResponse parses JSON error body", () => {
    const err = CantonClientError.fromResponse(400, '{"code":"X","cause":"Y"}');
    expect(err.code).toBe("X");
    expect(err.cause).toBe("Y");
  });

  it("fromResponse handles non-JSON body", () => {
    const err = CantonClientError.fromResponse(500, "Internal Server Error");
    expect(err.code).toBe("HTTP_ERROR");
    expect(err.cause).toContain("Internal Server Error");
  });
});

describe("CantonTimeoutError", () => {
  it("is retryable", () => {
    const err = new CantonTimeoutError();
    expect(err.retryable).toBe(true);
  });
});

describe("submitAndWait error handling", () => {
  it("throws CantonClientError on 400", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () =>
          Promise.resolve(
            JSON.stringify({ code: "INVALID_ARGUMENT", cause: "Bad template" })
          ),
      })
    );

    const client = new CantonLedgerClient({ baseUrl: MOCK_BASE });
    const commands = buildCommands({
      commandId: "cmd-1",
      commands: [createCommand("Bad:Template", {})],
      actAs: ["Alice"],
    });

    await expect(client.submitAndWait(commands)).rejects.toThrow(CantonClientError);
  });
});
