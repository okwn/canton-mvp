"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useWalletSession, useConnectWallet } from "@/hooks/useWallet";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui";
import Link from "next/link";

export default function WalletPage() {
  const { userId } = useAuth();
  const session = useWalletSession();
  const connect = useConnectWallet();

  if (!userId) {
    return (
      <EmptyState
        title="Not signed in"
        description="Sign in to view wallet session."
        action={<Link href="/connect">Go to Connect</Link>}
      />
    );
  }

  if (session.isLoading) return <LoadingState />;
  if (session.isError) return <ErrorState error={session.error} onRetry={() => session.refetch()} />;

  const data = session.data;
  const hasSession = data?.session != null;

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Wallet</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Session state and wallet connection.
      </p>
      <div
        style={{
          padding: "1.5rem",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          background: "var(--color-surface)",
          maxWidth: 480,
        }}
      >
        <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Session</h2>
        {hasSession ? (
          <div style={{ fontSize: "0.875rem" }}>
            <p style={{ margin: "0 0 0.5rem" }}>
              <strong>Party:</strong> {data?.session?.partyId?.slice(0, 30)}…
            </p>
            <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
              Connected at: {data?.connectedAt ? new Date(data.connectedAt).toISOString() : "—"}
            </p>
          </div>
        ) : (
          <EmptyState
            title="Not connected"
            description="Connect the wallet to establish a session."
            action={
              <button
                type="button"
                onClick={() => connect.mutate()}
                disabled={connect.isPending}
                style={{
                  padding: "0.5rem 1rem",
                  background: "var(--color-accent)",
                  border: "none",
                  borderRadius: 4,
                  color: "white",
                  cursor: connect.isPending ? "not-allowed" : "pointer",
                }}
              >
                {connect.isPending ? "Connecting…" : "Connect"}
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
