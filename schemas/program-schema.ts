import { z } from "zod";

export const programFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  duration: z.string().min(1, { message: "Duration is required." }),
  desc: z.string().optional(),
  priceList: z.string().optional(),
  sourceUrl: z
    .string()
    .url({ message: "Invalid URL." })
    .optional()
    .or(z.literal("")),
  propertyId: z.string().min(1, { message: "Property is required." }),
  hostId: z.string().optional(),
});

export type ProgramFormData = z.infer<typeof programFormSchema>;
