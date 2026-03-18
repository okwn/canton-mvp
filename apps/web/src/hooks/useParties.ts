"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

export function useParties(userId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["parties", userId],
    queryFn: () => apiGet<Array<{ partyId: string; userId: string; source: string }>>(`/parties/users/${userId}`, token ?? undefined),
    enabled: !!userId && !!token,
  });
}

export function usePrimaryParty(userId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["primaryParty", userId],
    queryFn: () => apiGet<{ partyId: string; userId: string }>(`/parties/users/${userId}/primary`, token ?? undefined),
    enabled: !!userId && !!token,
  });
}

export function useAllocateParty(userId: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { partyId: string; source: "validator" | "wallet" | "manual"; displayName?: string }) =>
      apiPost(`/parties/users/${userId}/allocate`, body, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parties", userId] }),
  });
}
