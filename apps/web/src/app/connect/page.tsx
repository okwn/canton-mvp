"use client";

import { LoginForm } from "@/components/forms/LoginForm";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ConnectPage() {
  const { userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userId) router.replace("/dashboard");
  }, [userId, router]);

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Connect</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Sign in to access the app. In development, this creates a mock user.
      </p>
      <LoginForm />
    </div>
  );
}
