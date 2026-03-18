/**
 * Command builders for Daml create, exercise, create-and-exercise.
 * Domain-specific helpers for JSON Ledger API v2 payload assembly.
 */

import type {
  CreateCommand,
  ExerciseCommand,
  CreateAndExerciseCommand,
  Command,
  JsCommands,
} from "./types.js";

/** Build a CreateCommand. */
export function createCommand(
  templateId: string,
  createArguments: Record<string, unknown>
): CreateCommand {
  return {
    CreateCommand: {
      templateId,
      createArguments,
    },
  };
}

/** Build an ExerciseCommand. */
export function exerciseCommand(
  templateId: string,
  contractId: string,
  choice: string,
  choiceArgument: Record<string, unknown>
): ExerciseCommand {
  return {
    ExerciseCommand: {
      templateId,
      contractId,
      choice,
      choiceArgument,
    },
  };
}

/** Build a CreateAndExerciseCommand. */
export function createAndExerciseCommand(
  templateId: string,
  createArguments: Record<string, unknown>,
  choice: string,
  choiceArgument: Record<string, unknown>
): CreateAndExerciseCommand {
  return {
    CreateAndExerciseCommand: {
      templateId,
      createArguments,
      choice,
      choiceArgument,
    },
  };
}

/** Build JsCommands for submission. */
export function buildCommands(params: {
  commandId: string;
  commands: Command[];
  actAs: string[];
  userId?: string;
  readAs?: string[];
  workflowId?: string;
}): JsCommands {
  return {
    commandId: params.commandId,
    commands: params.commands,
    actAs: params.actAs,
    ...(params.userId !== undefined && { userId: params.userId }),
    ...(params.readAs !== undefined && { readAs: params.readAs }),
    ...(params.workflowId !== undefined && { workflowId: params.workflowId }),
  };
}

/** Generate a unique command ID (UUID v4). */
export function generateCommandId(): string {
  return crypto.randomUUID();
}

/** Daml template ID: "ModuleName:TemplateName" or "PackageId:ModuleName:TemplateName". */
export function templateId(moduleName: string, templateName: string, packageId?: string): string {
  if (packageId) {
    return `${packageId}:${moduleName}:${templateName}`;
  }
  return `${moduleName}:${templateName}`;
}
