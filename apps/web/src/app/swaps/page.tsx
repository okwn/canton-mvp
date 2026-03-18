"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { EmptyState } from "@/components/ui";

export default function SwapsPage() {
  const { userId } = useAuth();

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Swaps</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Quote and swap workflows. Request a quote, respond, accept or reject.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link
            href="/swaps/new"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "var(--color-accent)",
              color: "white",
              borderRadius: 4,
              width: "fit-content",
            }}
          >
            New quote request
          </Link>
        </div>
        {!userId && (
          <EmptyState
            title="Sign in required"
            description="Sign in to create and manage swaps."
            action={<Link href="/connect">Go to Connect</Link>}
          />
        )}
      </div>
    </div>
  );
}
