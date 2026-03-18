/**
 * Raw Scan API transport shapes.
 * Separate from normalized DTOs in shared-types.
 */

/** Raw scan item from /api/scan/v0/scans. */
export interface RawScan {
  scan_id?: string;
  url?: string;
  synchronizer_id?: string;
  [key: string]: unknown;
}

/** Raw response from /api/scan/v0/scans. */
export type RawScansResponse = RawScan[] | { scans?: RawScan[] };
