import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Canton MVP</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Reference frontend for Canton app builders. Onboarding, wallet, tokens, swaps.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Link href="/connect">Connect wallet / Sign in</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/wallet">Wallet session</Link>
        <Link href="/tokens">Balances & holdings</Link>
        <Link href="/swaps">Swaps</Link>
        <Link href="/swaps/new">New quote request</Link>
        <Link href="/admin/network">Network diagnostics</Link>
        <Link href="/dev/contracts">Developer: contracts</Link>
      </div>
    </div>
  );
}
