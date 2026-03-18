"use client";

import { useAuth } from "@/providers/AuthProvider";
import { QuoteRequestForm } from "@/components/forms/QuoteRequestForm";
import { EmptyState } from "@/components/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewQuotePage() {
  const { userId } = useAuth();
  const router = useRouter();

  if (!userId) {
    return (
      <EmptyState
        title="Sign in required"
        description="Sign in to request quotes."
        action={<Link href="/connect">Go to Connect</Link>}
      />
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>New quote request</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Request a quote for a bilateral exchange. Enter requester, counterparty, and leg details.
      </p>
      <QuoteRequestForm
        onSuccess={() => {
          router.push("/swaps");
        }}
      />
    </div>
  );
}
