"use client";

export default function DevContractsPage() {
  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Developer: contracts</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Developer mode panel for contract inspection and debugging.
      </p>
      <div
        style={{
          padding: "2rem",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          background: "var(--color-surface)",
        }}
      >
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Contract templates and active contract views will be integrated here. Connect to the
          ledger and token-standard packages for holdings and settlement.
        </p>
      </div>
    </div>
  );
}
