import { z } from "zod";
import { tokenInstrumentIdSchema } from "./registry.js";

export const settlementLegDirectionSchema = z.enum(["debit", "credit"]);

export const settlementLegSchema = z.object({
  party: z.string().min(1),
  instrumentId: tokenInstrumentIdSchema,
  amount: z.string(),
  direction: settlementLegDirectionSchema,
  legId: z.string().optional(),
});

export const settlementSchema = z.object({
  legs: z.array(settlementLegSchema).min(1),
  settlementId: z.string().optional(),
});
