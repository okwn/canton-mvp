"use client";

export interface TimelineEvent {
  id: string;
  type: string;
  timestamp: string;
  summary: string;
  status?: "pending" | "success" | "error";
}

export function EventTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div style={{ padding: "2rem", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
        No events yet
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {events.map((event, i) => (
        <div
          key={event.id}
          style={{
            display: "flex",
            gap: "1rem",
            padding: "0.75rem 0",
            borderBottom: i < events.length - 1 ? "1px solid var(--color-border)" : "none",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background:
                event.status === "success"
                  ? "var(--color-success)"
                  : event.status === "error"
                    ? "var(--color-error)"
                    : "var(--color-border)",
              flexShrink: 0,
              marginTop: 4,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              {event.timestamp} · {event.type}
            </div>
            <div style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>{event.summary}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
