import * as z from "zod";

export const retreatInstanceFormSchema = z.object({
  retreatId: z.string().min(1, { message: "Retreat is required." }),
  startDate: z.date(),
  endDate: z.date(),
  duration: z.number().min(0),
  itinerary: z.string(),
  availableSlots: z.number().min(0),
  isFull: z.boolean(),
});

export type RetreatInstanceFormData = z.infer<typeof retreatInstanceFormSchema>;
