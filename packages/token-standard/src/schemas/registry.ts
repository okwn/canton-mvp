import { z } from "zod";

export const tokenInstrumentIdSchema = z.object({
  admin: z.string().min(1),
  symbol: z.string().min(1),
});

export const tokenRegistryEntrySchema = z.object({
  instrumentId: tokenInstrumentIdSchema,
  name: z.string().optional(),
  decimals: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional(),
});
