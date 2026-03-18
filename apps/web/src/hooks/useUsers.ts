"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

export function useUser(userId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiGet<{ id: string; email?: string; role: string }>(`/users/${userId}`, token ?? undefined),
    enabled: !!userId && !!token,
  });
}

export function useCreateUser() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email?: string; externalId?: string; role?: string }) =>
      apiPost<{ id: string }>("/users", body, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
