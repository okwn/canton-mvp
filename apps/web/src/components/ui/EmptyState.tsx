export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "3rem",
        textAlign: "center",
        color: "var(--color-text-muted)",
      }}
    >
      <h3 style={{ color: "var(--color-text)", marginBottom: "0.5rem" }}>{title}</h3>
      {description && <p style={{ marginBottom: "1rem" }}>{description}</p>}
      {action}
    </div>
  );
}
