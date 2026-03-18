"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

const nav = [
  { href: "/", label: "Home" },
  { href: "/connect", label: "Connect" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wallet", label: "Wallet" },
  { href: "/tokens", label: "Tokens" },
  { href: "/swaps", label: "Swaps" },
  { href: "/admin/network", label: "Network" },
  { href: "/admin/ops", label: "Ops" },
  { href: "/dev/contracts", label: "Dev" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userId, clearAuth } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 200,
          borderRight: "1px solid var(--color-border)",
          padding: "1rem 0",
        }}
      >
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: "0.5rem 1rem",
                color: pathname === href ? "var(--color-accent)" : "var(--color-text)",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: "auto", padding: "1rem", borderTop: "1px solid var(--color-border)" }}>
          {userId ? (
            <>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {userId.slice(0, 12)}…
              </div>
              <button
                type="button"
                onClick={clearAuth}
                style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/connect" style={{ fontSize: "0.875rem" }}>
              Sign in
            </Link>
          )}
        </div>
      </aside>
      <main style={{ flex: 1, padding: "2rem", overflow: "auto" }}>{children}</main>
    </div>
  );
}
