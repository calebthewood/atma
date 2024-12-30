import * as z from "zod";

export const priceModSchema = z.object({
  name: z.string().min(2).default("Price"),
  desc: z.string().default("Additional description to show in a tooltip"),
  type: z.string().default("BASE_PRICE"),
  currency: z.string().default("USD"),
  value: z.number().int().default(0),
  unit: z.string().default("FIXED"),
  dateStart: z.date().nullable().optional(),
  dateEnd: z.date().nullable().optional(),
  guestMin: z.number().int().nullable().optional(),
  guestMax: z.number().int().nullable().optional(),
  roomType: z.string().default("all"),
  hostId: z.string().nullable().optional(),
  propertyId: z.string().nullable().optional(),
  programId: z.string().nullable().optional(),
  retreatId: z.string().nullable().optional(),
  retreatInstanceId: z.string().nullable().optional(),
  programInstanceId: z.string().nullable().optional(),
});

export type PriceModInput = z.infer<typeof priceModSchema>;
