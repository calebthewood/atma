import * as z from "zod";

// Form data schema
export const instanceFormSchema = z.object({
  retreatId: z.string(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  duration: z.number().default(0),
  itinerary: z
    .string()
    .default("Bulleted list of items, end each point with a semicolon;"),
  availableSlots: z.number(),
  isFull: z.boolean().default(false),
  verifiedBy: z.string().optional(),
  notes: z.string().optional(),
});

export type InstanceFormData = z.infer<typeof instanceFormSchema>;
