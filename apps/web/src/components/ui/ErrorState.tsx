export function ErrorState({
  error,
  onRetry,
}: {
  error: Error | string;
  onRetry?: () => void;
}) {
  const msg = error instanceof Error ? error.message : error;
  return (
    <div style={{ padding: "2rem", color: "var(--color-error)" }}>
      <p>{msg}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} style={{ marginTop: "1rem" }}>
          Retry
        </button>
      )}
    </div>
  );
}
