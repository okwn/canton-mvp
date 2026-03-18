"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRequestQuote } from "@/hooks/useSwaps";

const schema = z.object({
  requester: z.string().min(1, "Required"),
  counterparty: z.string().min(1, "Required"),
  giveAdmin: z.string().min(1, "Required"),
  giveSymbol: z.string().min(1, "Required"),
  giveAmount: z.string().min(1, "Required"),
  receiveAdmin: z.string().min(1, "Required"),
  receiveSymbol: z.string().min(1, "Required"),
  receiveAmount: z.string().min(1, "Required"),
  validUntilMs: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

export function QuoteRequestForm({ onSuccess }: { onSuccess?: () => void }) {
  const requestQuote = useRequestQuote();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        requestQuote.mutate(
          {
            requester: data.requester,
            counterparty: data.counterparty,
            giveInstrument: { admin: data.giveAdmin, symbol: data.giveSymbol },
            giveAmount: data.giveAmount,
            receiveInstrument: { admin: data.receiveAdmin, symbol: data.receiveSymbol },
            receiveAmount: data.receiveAmount,
            ...(data.validUntilMs !== undefined && { validUntilMs: data.validUntilMs }),
          },
          { onSuccess: () => onSuccess?.() }
        );
      })}
      style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 480 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label htmlFor="quote-requester" style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>Requester</label>
          <input id="quote-requester" {...register("requester")} style={inputStyle} />
          {errors.requester && <span style={errorStyle}>{errors.requester.message}</span>}
        </div>
        <div>
          <label htmlFor="quote-counterparty" style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>Counterparty</label>
          <input id="quote-counterparty" {...register("counterparty")} style={inputStyle} />
          {errors.counterparty && <span style={errorStyle}>{errors.counterparty.message}</span>}
        </div>
      </div>
      <fieldset style={{ border: "1px solid var(--color-border)", padding: "1rem", borderRadius: 4 }}>
        <legend style={{ fontSize: "0.875rem" }}>Give</legend>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
          <input {...register("giveAdmin")} placeholder="Admin" style={inputStyle} />
          <input {...register("giveSymbol")} placeholder="Symbol" style={inputStyle} />
          <input {...register("giveAmount")} placeholder="Amount" style={inputStyle} />
        </div>
      </fieldset>
      <fieldset style={{ border: "1px solid var(--color-border)", padding: "1rem", borderRadius: 4 }}>
        <legend style={{ fontSize: "0.875rem" }}>Receive</legend>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
          <input {...register("receiveAdmin")} placeholder="Admin" style={inputStyle} />
          <input {...register("receiveSymbol")} placeholder="Symbol" style={inputStyle} />
          <input {...register("receiveAmount")} placeholder="Amount" style={inputStyle} />
        </div>
      </fieldset>
      <button type="submit" disabled={requestQuote.isPending} style={buttonStyle}>
        {requestQuote.isPending ? "Requesting…" : "Request quote"}
      </button>
      {requestQuote.isError && <span style={errorStyle}>{requestQuote.error?.message}</span>}
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 4,
  color: "var(--color-text)",
};
const errorStyle: React.CSSProperties = { color: "var(--color-error)", fontSize: "0.75rem" };
const buttonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  background: "var(--color-accent)",
  border: "none",
  borderRadius: 4,
  color: "white",
  cursor: "pointer",
};
