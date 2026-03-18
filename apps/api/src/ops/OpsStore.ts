/**
 * Ops store - ring buffers for recent errors and command submissions.
 */

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
  status: "pending" | "submitted" | "failed";
  error?: string;
}

const DEFAULT_CAPACITY = 200;

export class OpsStore {
  private errors: OpsError[] = [];
  private commands: CommandSubmission[] = [];
  private readonly capacity: number;

  constructor(capacity = DEFAULT_CAPACITY) {
    this.capacity = capacity;
  }

  recordError(err: Omit<OpsError, "id" | "timestamp">): void {
    this.errors.unshift({
      ...err,
      id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    });
    if (this.errors.length > this.capacity) this.errors.pop();
  }

  recordCommand(cmd: Omit<CommandSubmission, "id" | "timestamp">): void {
    this.commands.unshift({
      ...cmd,
      id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    });
    if (this.commands.length > this.capacity) this.commands.pop();
  }

  getRecentErrors(limit = 50): OpsError[] {
    return this.errors.slice(0, limit);
  }

  getRecentCommands(limit = 50): CommandSubmission[] {
    return this.commands.slice(0, limit);
  }
}
