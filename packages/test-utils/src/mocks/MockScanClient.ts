/**
 * Mock Scan API client for tests.
 * Returns fixture data without network calls.
 */

import type { ScanList } from "@canton-mvp/shared-types";

export interface MockScanClientOptions {
  scans?: ScanList["scans"];
}

export class MockScanClient {
  private readonly opts: MockScanClientOptions;

  constructor(opts: MockScanClientOptions = {}) {
    this.opts = opts;
  }

  async getScans(): Promise<ScanList> {
    return {
      scans: this.opts.scans ?? [
        { scanId: "scan-1", url: "http://scan.test", synchronizerId: "sync-1" },
      ],
    };
  }

  async getNetworkMetadata(): Promise<ScanList> {
    return this.getScans();
  }

  getTransferRegistryInfo(): { transferFactoryUrl: string } {
    return {
      transferFactoryUrl: "http://scan.test/registry/transfer-instruction/v1/transfer-factory",
    };
  }
}
