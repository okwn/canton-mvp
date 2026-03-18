"use client";

export interface TransactionReviewProps {
  summary?: string;
  legs: Array<{ party: string; instrument: string; amount: string; direction: "debit" | "credit" }>;
  onConfirm?: () => void;
  onReject?: () => void;
  rejectLabel?: string;
  isLoading?: boolean;
}

export function TransactionReview({
  summary,
  legs,
  onConfirm,
  onReject,
  rejectLabel = "Reject",
  isLoading,
}: TransactionReviewProps) {
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: "1.5rem",
        background: "var(--color-surface)",
      }}
    >
      {summary && (
        <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)" }}>{summary}</p>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>Party</th>
            <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>Instrument</th>
            <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>Amount</th>
            <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>Direction</th>
          </tr>
        </thead>
        <tbody>
          {legs.map((leg, i) => (
            <tr key={i}>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>
                {leg.party.slice(0, 20)}…
              </td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>
                {leg.instrument}
              </td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--color-border)", textAlign: "right" }}>
                {leg.amount}
              </td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>
                <span style={{ color: leg.direction === "debit" ? "var(--color-error)" : "var(--color-success)" }}>
                  {leg.direction}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {(onConfirm || onReject) && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                padding: "0.5rem 1rem",
                background: "var(--color-success)",
                border: "none",
                borderRadius: 4,
                color: "white",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Confirming…" : "Confirm"}
            </button>
          )}
          {onReject && (
            <button
              type="button"
              onClick={onReject}
              disabled={isLoading}
              style={{
                padding: "0.5rem 1rem",
                background: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: 4,
                color: "var(--color-text)",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {rejectLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
