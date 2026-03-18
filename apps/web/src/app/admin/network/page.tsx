"use client";

import { useNetworkMetadata, useNetworkConfig } from "@/hooks/useNetwork";
import { LoadingState, ErrorState } from "@/components/ui";

export default function NetworkPage() {
  const metadata = useNetworkMetadata();
  const config = useNetworkConfig();

  if (metadata.isLoading || config.isLoading) return <LoadingState />;
  if (metadata.isError) return <ErrorState error={metadata.error} onRetry={() => metadata.refetch()} />;

  const meta = metadata.data;
  const cfg = config.data;

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Network diagnostics</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Validator metadata and Canton config.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 560 }}>
        <section
          style={{
            padding: "1.5rem",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            background: "var(--color-surface)",
          }}
        >
          <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Metadata</h2>
          {meta?.validatorUser ? (
            <div style={{ fontSize: "0.875rem" }}>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>User ID:</strong> {meta.validatorUser.userId ?? "—"}
              </p>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Primary party:</strong> {meta.validatorUser.primaryParty ?? "—"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>DSO party:</strong> {meta.dsoParty?.dsoPartyId ?? "—"}
              </p>
            </div>
          ) : (
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
              {meta?.message ?? "Validator not configured. Set VALIDATOR_API_URL."}
            </p>
          )}
        </section>
        <section
          style={{
            padding: "1.5rem",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            background: "var(--color-surface)",
          }}
        >
          <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Config</h2>
          <div style={{ fontSize: "0.875rem" }}>
            <p style={{ margin: "0 0 0.5rem" }}>
              <strong>Ledger API:</strong> {cfg?.ledgerApiUrl ?? "—"}
            </p>
            <p style={{ margin: "0 0 0.5rem" }}>
              <strong>Validator API:</strong> {cfg?.validatorApiUrl ?? "—"}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Scan API:</strong> {cfg?.scanApiUrl ?? "—"}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
