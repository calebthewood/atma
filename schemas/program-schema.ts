import { z } from "zod";

export const programFormSchema = z.object({
  bookingType: z.string().optional(),
  status: z.string().optional(),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .optional(),
  category: z.string().optional(),
  desc: z
    .string()
    .min(8, { message: "Description must be at least 10 characters." })
    .optional(),
  keyBenefits: z.string().optional(),
  programApproach: z.string().optional(),
  whoIsthisFor: z.string().optional(),
  policyCancel: z.string().optional(),
  minGuests: z.number().int().min(1).optional(),
  maxGuests: z.number().int().min(-1).optional(),
  sourceUrl: z.string().optional(),
  hostId: z.string().min(1, { message: "Host is required." }),
  propertyId: z.string().min(1, { message: "Property is required." }),
});

export type ProgramFormData = z.infer<typeof programFormSchema>;
