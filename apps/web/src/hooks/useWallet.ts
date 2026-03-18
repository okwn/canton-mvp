"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

export function useWalletSession() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["wallet", "session"],
    queryFn: () => apiGet<{ session: { partyId: string } | null; connectedAt: number | null }>("/wallet/session", token ?? undefined),
    enabled: !!token,
  });
}

export function useConnectWallet() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost("/wallet/connect", {}, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wallet"] }),
  });
}
