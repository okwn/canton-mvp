"use client";

import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import { useAuth as useAuthContext } from "@/providers/AuthProvider";

export function useLogin() {
  const { setAuth } = useAuthContext();
  return useMutation({
    mutationFn: async (body: { email?: string; externalId?: string }) => {
      const res = await apiPost<{ userId: string }>("/auth/login", body);
      return res;
    },
    onSuccess: (data) => {
      setAuth(data.userId);
    },
  });
}
