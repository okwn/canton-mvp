import { z } from "zod";
import { tokenInstrumentIdSchema } from "./registry.js";

export const holdingSchema = z.object({
  instrumentId: tokenInstrumentIdSchema,
  amount: z.string(),
  contractId: z.string().optional(),
  owner: z.string().optional(),
});

export const balanceSchema = z.object({
  instrumentId: tokenInstrumentIdSchema,
  amount: z.string(),
  totalHoldings: z.number().int().min(0).optional(),
});
