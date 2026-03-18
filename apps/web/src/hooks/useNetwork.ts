"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export function useNetworkMetadata() {
  return useQuery({
    queryKey: ["network", "metadata"],
    queryFn: () =>
      apiGet<{
        validatorUser: { userId?: string; primaryParty?: string } | null;
        dsoParty: { dsoPartyId?: string } | null;
        message?: string;
      }>("/network/metadata"),
  });
}

export function useNetworkConfig() {
  return useQuery({
    queryKey: ["network", "config"],
    queryFn: () =>
      apiGet<{
        ledgerApiUrl: string | null;
        validatorApiUrl: string | null;
        scanApiUrl: string | null;
      }>("/network/config"),
  });
}
