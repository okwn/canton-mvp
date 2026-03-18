"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useUser } from "@/hooks/useUsers";
import { usePrimaryParty } from "@/hooks/useParties";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui";
import Link from "next/link";

export default function DashboardPage() {
  const { userId } = useAuth();
  const user = useUser(userId);
  const party = usePrimaryParty(userId);

  if (!userId) {
    return (
      <EmptyState
        title="Not signed in"
        description="Sign in to view your dashboard."
        action={<Link href="/connect">Go to Connect</Link>}
      />
    );
  }

  if (user.isLoading) return <LoadingState />;
  if (user.isError) return <ErrorState error={user.error} onRetry={() => user.refetch()} />;

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Dashboard</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Overview of your account and linked party.
      </p>
      <div
        style={{
          display: "grid",
          gap: "1rem",
          maxWidth: 480,
        }}
      >
        <section
          style={{
            padding: "1rem",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            background: "var(--color-surface)",
          }}
        >
          <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>User</h2>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>ID: {user.data?.id}</p>
          {user.data?.email && (
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem" }}>Email: {user.data.email}</p>
          )}
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem" }}>Role: {user.data?.role}</p>
        </section>
        <section
          style={{
            padding: "1rem",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            background: "var(--color-surface)",
          }}
        >
          <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Primary party</h2>
          {party.isLoading && <LoadingState message="Loading party…" />}
          {party.isError && party.error?.message !== "No party linked" && (
            <ErrorState error={party.error} onRetry={() => party.refetch()} />
          )}
          {party.isError && party.error?.message === "No party linked" && (
            <EmptyState
              title="No party linked"
              description="Allocate a party from the wallet or parties flow."
              action={<Link href="/wallet">Go to Wallet</Link>}
            />
          )}
          {party.data && (
            <p style={{ margin: 0, fontSize: "0.875rem", wordBreak: "break-all" }}>
              {party.data.partyId}
            </p>
          )}
          {party.isSuccess && !party.data && (
            <EmptyState
              title="No party linked"
              description="Allocate a party from the wallet or parties flow."
              action={<Link href="/wallet">Go to Wallet</Link>}
            />
          )}
        </section>
      </div>
    </div>
  );
}
