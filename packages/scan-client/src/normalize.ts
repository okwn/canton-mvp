/**
 * Normalize raw Scan API responses to app-facing DTOs.
 */

import type { ScanInfo, ScanList } from "@canton-mvp/shared-types";
import type { RawScan, RawScansResponse } from "./types.js";

function normalizeScan(raw: RawScan): ScanInfo {
  return {
    scanId: String(raw["scan_id"] ?? raw["scanId"] ?? ""),
    url: String(raw["url"] ?? ""),
    synchronizerId: String(raw["synchronizer_id"] ?? raw["synchronizerId"] ?? ""),
  };
}

export function normalizeScansResponse(raw: RawScansResponse): ScanList {
  const arr = Array.isArray(raw) ? raw : raw.scans ?? [];
  return {
    scans: arr.map((s) => normalizeScan(s)),
  };
}
