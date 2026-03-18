/**
 * API client for Canton MVP backend.
 */

const API_BASE = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:8080/api/v1";

export async function api<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...init } = options ?? {};
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const apiGet = <T>(path: string, token?: string) =>
  api<T>(path, { method: "GET", ...(token !== undefined && { token }) });
export const apiPost = <T>(path: string, body: unknown, token?: string) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body), ...(token !== undefined && { token }) });
export const apiPatch = <T>(path: string, body: unknown, token?: string) =>
  api<T>(path, { method: "PATCH", body: JSON.stringify(body), ...(token !== undefined && { token }) });
