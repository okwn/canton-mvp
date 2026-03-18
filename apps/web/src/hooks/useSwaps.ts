"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type TokenInstrumentId = { admin: string; symbol: string };

export function useDeal(dealId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["deal", dealId],
    queryFn: () =>
      apiGet<{
        id: string;
        state: string;
        giveLeg: { party: string; instrumentId: TokenInstrumentId; amount: string };
        receiveLeg: { party: string; instrumentId: TokenInstrumentId; amount: string };
      }>(`/swaps/deals/${dealId}`, token ?? undefined),
    enabled: !!dealId && !!token,
  });
}

export function useRequestQuote() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      requester: string;
      counterparty: string;
      giveInstrument: { admin: string; symbol: string };
      giveAmount: string;
      receiveInstrument: { admin: string; symbol: string };
      receiveAmount: string;
      validUntilMs?: number;
    }) => apiPost("/swaps/quotes", body, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useRespondQuote() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      requestId: string;
      counterparty: string;
      giveInstrument: { admin: string; symbol: string };
      giveAmount: string;
      receiveInstrument: { admin: string; symbol: string };
      receiveAmount: string;
      validUntilMs?: number;
    }) => apiPost("/swaps/quotes/respond", body, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useAcceptQuote() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { responseId: string; decidedBy: string }) =>
      apiPost<{ decision: unknown; deal: { id: string } }>("/swaps/quotes/accept", body, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deals"] }),
  });
}

export function useRejectQuote() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { responseId: string; decidedBy: string; reason?: string }) =>
      apiPost("/swaps/quotes/reject", body, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useCancelDeal() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dealId: string) => apiPost(`/swaps/deals/${dealId}/cancel`, {}, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deals"] }),
  });
}
