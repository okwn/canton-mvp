"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

export function useHoldings(partyId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["holdings", partyId],
    queryFn: () =>
      apiGet<
        Array<{ instrumentId: { admin: string; symbol: string }; amount: string; contractId?: string }>
      >(`/tokens/holdings/${partyId}`, token ?? undefined),
    enabled: !!partyId && !!token,
  });
}

export function useBalances(partyId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["balances", partyId],
    queryFn: () =>
      apiGet<
        Array<{ instrumentId: { admin: string; symbol: string }; amount: string; totalHoldings?: number }>
      >(`/tokens/balances/${partyId}`, token ?? undefined),
    enabled: !!partyId && !!token,
  });
}
