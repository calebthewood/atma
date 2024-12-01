import { z } from "zod";

export const retreatFormSchema = z.object({
  bookingType: z.string(),
  status: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.string(),
  desc: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." }),
  keyBenefits: z.string(),
  programApproach: z.string(),
  whoIsthisFor: z.string(),
  policyCancel: z.string(),
  duration: z.string().min(1, { message: "Duration is required." }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format.",
  }),
  minGuests: z.number().int().min(1),
  maxGuests: z.number().int().min(-1),
  sourceUrl: z.string().optional(),
  hostId: z.string().min(1, { message: "Host is required." }).nullable(),
  propertyId: z.string().min(1, { message: "Property is required." }),
});

export type RetreatFormData = z.infer<typeof retreatFormSchema>;
