"use client";

import { useParams } from "next/navigation";
import { useDeal, useCancelDeal } from "@/hooks/useSwaps";
import { TransactionReview } from "@/components/transaction/TransactionReview";
import { EventTimeline } from "@/components/timeline/EventTimeline";
import { LoadingState, ErrorState } from "@/components/ui";
import Link from "next/link";

export default function DealDetailPage() {
  const params = useParams();
  const dealId = params["dealId"] as string;
  const deal = useDeal(dealId);
  const cancel = useCancelDeal();

  if (deal.isLoading) return <LoadingState />;
  if (deal.isError) return <ErrorState error={deal.error} onRetry={() => deal.refetch()} />;
  if (!deal.data) return null;

  const d = deal.data;
  const legs = [
    {
      party: d.giveLeg.party,
      instrument: d.giveLeg.instrumentId.symbol,
      amount: d.giveLeg.amount,
      direction: "debit" as const,
    },
    {
      party: d.receiveLeg.party,
      instrument: d.receiveLeg.instrumentId.symbol,
      amount: d.receiveLeg.amount,
      direction: "debit" as const,
    },
  ];

  const events = [
    { id: "1", type: "deal", timestamp: new Date().toISOString(), summary: `Deal ${d.id} - ${d.state}`, status: "success" as const },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Deal {d.id.slice(0, 12)}…</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        State: {d.state}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: 560 }}>
        <TransactionReview
          summary="Bilateral exchange"
          legs={legs}
          {...(["accepted", "approvals_pending", "settlement_ready"].includes(d.state) && { onReject: () => cancel.mutate(dealId) })}
          rejectLabel="Cancel"
          isLoading={cancel.isPending}
        />
        <section
          style={{
            padding: "1.5rem",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            background: "var(--color-surface)",
          }}
        >
          <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Timeline</h2>
          <EventTimeline events={events} />
        </section>
      </div>
      <Link href="/swaps" style={{ display: "inline-block", marginTop: "1rem" }}>
        ← Back to Swaps
      </Link>
    </div>
  );
}
