/**
 * Minimal Canton MVP API client.
 * Reusable for examples, integrations, and external apps.
 */

const DEFAULT_BASE = "http://localhost:8080/api/v1";

export interface ApiClientOptions {
  baseUrl?: string;
  token?: string;
}

export function createApiClient(opts: ApiClientOptions = {}) {
  const base = opts.baseUrl ?? process.env["API_URL"] ?? DEFAULT_BASE;
  const token = opts.token ?? "";

  async function request<T>(
    path: string,
    init?: Omit<RequestInit, "body"> & { body?: unknown }
  ): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const { body, ...rest } = init ?? {};
    const reqInit: RequestInit = { ...rest, headers };
    if (body !== undefined) {
      reqInit.body = JSON.stringify(body);
      reqInit.method = reqInit.method ?? "POST";
    }
    const res = await fetch(`${base}${path}`, reqInit);
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  }

  return {
    get: <T>(path: string) => request<T>(path, { method: "GET" }),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
    patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
    withToken: (t: string) => createApiClient({ baseUrl: base, token: t }),
  };
}
