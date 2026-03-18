"use client";

import { useAuth } from "@/providers/AuthProvider";
import { usePrimaryParty } from "@/hooks/useParties";
import { useHoldings, useBalances } from "@/hooks/useTokens";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui";
import Link from "next/link";

export default function TokensPage() {
  const { userId } = useAuth();
  const party = usePrimaryParty(userId);
  const holdings = useHoldings(party.data?.partyId ?? null);
  const balances = useBalances(party.data?.partyId ?? null);

  if (!userId) {
    return (
      <EmptyState
        title="Not signed in"
        action={<Link href="/connect">Go to Connect</Link>}
      />
    );
  }

  if (party.isLoading || !party.data) {
    return (
      <EmptyState
        title="No party linked"
        description="Link a party to view balances."
        action={<Link href="/wallet">Go to Wallet</Link>}
      />
    );
  }

  if (holdings.isLoading) return <LoadingState />;
  if (holdings.isError) return <ErrorState error={holdings.error} onRetry={() => holdings.refetch()} />;

  const h = holdings.data ?? [];
  const b = balances.data ?? [];

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Tokens</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Balances and holdings for your party.
      </p>
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Balances</h2>
        {b.length === 0 ? (
          <EmptyState title="No balances" description="No token balances for this party." />
        ) : (
          <table style={{ width: "100%", maxWidth: 480, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>Instrument</th>
                <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {b.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>
                    {row.instrumentId.symbol} ({row.instrumentId.admin.slice(0, 12)}…)
                  </td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--color-border)", textAlign: "right" }}>
                    {row.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Holdings</h2>
        {h.length === 0 ? (
          <EmptyState title="No holdings" />
        ) : (
          <table style={{ width: "100%", maxWidth: 480, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>Instrument</th>
                <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {h.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>
                    {row.instrumentId.symbol}
                  </td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--color-border)", textAlign: "right" }}>
                    {row.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
