"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

const OPS_BASE = "/admin";

export interface OpsHealth {
  status: string;
  services: Record<string, string>;
  dependencies: Record<string, string>;
  wallet: { adapter: string; connected: boolean; partyId: string | null };
  timestamp: string;
}

export interface OpsError {
  id: string;
  timestamp: number;
  correlationId?: string;
  service: string;
  message: string;
  error?: string;
  context?: Record<string, unknown>;
}

export interface CommandSubmission {
  id: string;
  timestamp: number;
  correlationId?: string;
  commandType: string;
  partyId?: string;
  dealId?: string;
  status: string;
  error?: string;
}

export interface OpsSwaps {
  deals: Array<{
    id: string;
    state: string;
    requestId: string;
    createdAt: number;
    updatedAt: number;
  }>;
  quoteRequests: Array<{
    id: string;
    requester: string;
    counterparty: string;
    createdAt: number;
  }>;
}

export interface PartyAudit {
  partyId: string;
  userId: string;
  displayName?: string;
  source: string;
  createdAt: number;
  updatedAt: number;
}

function useOpsQuery<T>(path: string, token?: string) {
  return useQuery({
    queryKey: ["ops", path, token],
    queryFn: () => apiGet<T>(`${OPS_BASE}${path}`, token),
    enabled: !!token,
    staleTime: 10_000,
  });
}

export function useOpsHealth(token?: string) {
  return useOpsQuery<OpsHealth>("/ops/health", token);
}

export function useOpsErrors(token?: string, limit = 50) {
  return useOpsQuery<OpsError[]>(`/ops/errors?limit=${limit}`, token);
}

export function useOpsCommands(token?: string, limit = 50) {
  return useOpsQuery<CommandSubmission[]>(`/ops/commands?limit=${limit}`, token);
}

export function useOpsSwaps(token?: string, limit = 50) {
  return useOpsQuery<OpsSwaps>(`/ops/swaps?limit=${limit}`, token);
}

export function useOpsParties(token?: string, limit = 100) {
  return useOpsQuery<PartyAudit[]>(`/ops/parties?limit=${limit}`, token);
}
