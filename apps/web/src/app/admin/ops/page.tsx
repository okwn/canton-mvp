"use client";

import { useAuth } from "@/providers/AuthProvider";
import {
  useOpsHealth,
  useOpsErrors,
  useOpsCommands,
  useOpsSwaps,
  useOpsParties,
} from "@/hooks/useOps";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui";
import Link from "next/link";

const sectionStyle = {
  padding: "1.5rem",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  background: "var(--color-surface)",
  marginBottom: "1.5rem",
};

const tableStyle = {
  width: "100%",
  fontSize: "0.85rem",
  borderCollapse: "collapse" as const,
};

export default function AdminOpsPage() {
  const { token } = useAuth();
  const authToken = token ?? undefined;
  const health = useOpsHealth(authToken);
  const errors = useOpsErrors(authToken);
  const commands = useOpsCommands(authToken);
  const swaps = useOpsSwaps(authToken);
  const parties = useOpsParties(authToken);

  if (!token) {
    return (
      <div>
        <h1>Operations</h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Sign in to view operations. Admin role required.
        </p>
        <Link href="/connect">Sign in</Link>
      </div>
    );
  }

  const allLoading = health.isLoading || errors.isLoading || commands.isLoading || swaps.isLoading || parties.isLoading;
  const anyError = health.isError || errors.isError || commands.isError || swaps.isError || parties.isError;

  if (allLoading) return <LoadingState />;
  if (anyError) {
    const err = health.error ?? errors.error ?? commands.error ?? swaps.error ?? parties.error ?? new Error("Unknown error");
    return <ErrorState error={err} onRetry={() => { health.refetch(); errors.refetch(); commands.refetch(); swaps.refetch(); parties.refetch(); }} />;
  }

  const h = health.data;
  const errs = errors.data ?? [];
  const cmds = commands.data ?? [];
  const swapData = swaps.data;
  const partyData = parties.data ?? [];

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Operations</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Service health, dependencies, errors, commands, swap states, party audit.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 900 }}>
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Service health</h2>
          {h && (
            <div style={{ fontSize: "0.875rem" }}>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Status:</strong> {h.status}
              </p>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Services:</strong> {JSON.stringify(h.services)}
              </p>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Dependencies:</strong> {JSON.stringify(h.dependencies)}
              </p>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Wallet:</strong> {h.wallet.adapter} — {h.wallet.connected ? "connected" : "disconnected"}
                {h.wallet.partyId && ` (${h.wallet.partyId.slice(0, 20)}…)`}
              </p>
            </div>
          )}
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>API dependency health</h2>
          {h && (
            <div style={{ fontSize: "0.875rem" }}>
              <p style={{ margin: 0 }}>
                Validator: {h.dependencies?.["validator"] ?? "—"} | Ledger: {h.dependencies?.["ledger"] ?? "—"}
              </p>
            </div>
          )}
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Wallet adapter status</h2>
          {h && (
            <div style={{ fontSize: "0.875rem" }}>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Adapter:</strong> {h.wallet.adapter}
              </p>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Connected:</strong> {h.wallet.connected ? "Yes" : "No"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Party ID:</strong> {h.wallet.partyId ?? "—"}
              </p>
            </div>
          )}
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Swap flow states</h2>
          {swapData && (
            <div style={{ fontSize: "0.875rem" }}>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Deals:</strong> {swapData.deals.length}
              </p>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Quote requests:</strong> {swapData.quoteRequests.length}
              </p>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Deal ID</th>
                    <th style={{ textAlign: "left", padding: "0.5rem 0" }}>State</th>
                    <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {swapData.deals.slice(0, 10).map((d) => (
                    <tr key={d.id}>
                      <td style={{ padding: "0.25rem 0" }}>
                        <Link href={`/swaps/${d.id}`}>{d.id.slice(0, 20)}…</Link>
                      </td>
                      <td style={{ padding: "0.25rem 0" }}>{d.state}</td>
                      <td style={{ padding: "0.25rem 0", color: "var(--color-text-muted)" }}>
                        {new Date(d.updatedAt).toISOString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {swapData.deals.length === 0 && <EmptyState title="No deals" />}
            </div>
          )}
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Recent errors</h2>
          {errs.length === 0 ? (
            <EmptyState title="No recent errors" />
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Time</th>
                  <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Service</th>
                  <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Message</th>
                  <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Correlation ID</th>
                </tr>
              </thead>
              <tbody>
                {errs.slice(0, 15).map((e) => (
                  <tr key={e.id}>
                    <td style={{ padding: "0.25rem 0", color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                      {new Date(e.timestamp).toISOString()}
                    </td>
                    <td style={{ padding: "0.25rem 0" }}>{e.service}</td>
                    <td style={{ padding: "0.25rem 0" }}>{e.message}</td>
                    <td style={{ padding: "0.25rem 0", fontFamily: "monospace", fontSize: "0.75rem" }}>
                      {e.correlationId ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Command submissions</h2>
          {cmds.length === 0 ? (
            <EmptyState title="No recent commands" />
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Time</th>
                  <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Type</th>
                  <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Correlation ID</th>
                </tr>
              </thead>
              <tbody>
                {cmds.slice(0, 15).map((c) => (
                  <tr key={c.id}>
                    <td style={{ padding: "0.25rem 0", color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                      {new Date(c.timestamp).toISOString()}
                    </td>
                    <td style={{ padding: "0.25rem 0" }}>{c.commandType}</td>
                    <td style={{ padding: "0.25rem 0" }}>{c.status}</td>
                    <td style={{ padding: "0.25rem 0", fontFamily: "monospace", fontSize: "0.75rem" }}>
                      {c.correlationId ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Party onboarding audit trail</h2>
          {partyData.length === 0 ? (
            <EmptyState title="No parties" />
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Party ID</th>
                  <th style={{ textAlign: "left", padding: "0.5rem 0" }}>User ID</th>
                  <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Source</th>
                  <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {partyData.slice(0, 20).map((p) => (
                  <tr key={p.partyId}>
                    <td style={{ padding: "0.25rem 0", fontFamily: "monospace", fontSize: "0.8rem" }}>
                      {p.partyId.slice(0, 24)}…
                    </td>
                    <td style={{ padding: "0.25rem 0" }}>{p.userId}</td>
                    <td style={{ padding: "0.25rem 0" }}>{p.source}</td>
                    <td style={{ padding: "0.25rem 0", color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                      {new Date(p.createdAt).toISOString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
