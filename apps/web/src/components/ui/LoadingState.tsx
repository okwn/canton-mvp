export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div style={{ padding: "2rem", color: "var(--color-text-muted)" }}>
      {message}
    </div>
  );
}
