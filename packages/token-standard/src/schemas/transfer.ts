import { z } from "zod";
import { tokenInstrumentIdSchema } from "./registry.js";

export const transferIntentSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  instrumentId: tokenInstrumentIdSchema,
  amount: z.string(),
  referenceId: z.string().optional(),
});

export const transferApprovalStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const transferApprovalSchema = z.object({
  intent: transferIntentSchema,
  status: transferApprovalStatusSchema,
  approvalId: z.string().optional(),
});
