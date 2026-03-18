"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  externalId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", externalId: "" },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        login.mutate({
          ...(data.email && { email: data.email }),
          externalId: data.externalId || `ext-${Date.now()}`,
        });
      })}
      style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 320 }}
    >
      <div>
        <label htmlFor="email" style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          style={{
            width: "100%",
            padding: "0.5rem",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 4,
            color: "var(--color-text)",
          }}
        />
        {errors.email && <span style={{ color: "var(--color-error)", fontSize: "0.75rem" }}>{errors.email.message}</span>}
      </div>
      <button
        type="submit"
        disabled={login.isPending}
        style={{
          padding: "0.5rem 1rem",
          background: "var(--color-accent)",
          border: "none",
          borderRadius: 4,
          color: "white",
          cursor: login.isPending ? "not-allowed" : "pointer",
        }}
      >
        {login.isPending ? "Signing in…" : "Sign in"}
      </button>
      {login.isError && (
        <span style={{ color: "var(--color-error)", fontSize: "0.875rem" }}>
          {login.error?.message}
        </span>
      )}
    </form>
  );
}
