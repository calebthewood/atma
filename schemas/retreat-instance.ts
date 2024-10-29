import * as z from "zod";

export const retreatInstanceFormSchema = z
  .object({
    retreatId: z.string().min(1, "Retreat is required"),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    minNights: z
      .number()
      .min(1, "Minimum nights must be at least 1")
      .default(1),
    maxNights: z
      .number()
      .min(-1, "Maximum nights must be -1 (unlimited) or greater")
      .default(-1),
    availableSlots: z.number().min(0, "Available slots cannot be negative"),
    isFull: z.boolean().default(false),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      if (data.maxNights === -1) return true;
      return data.maxNights >= data.minNights;
    },
    {
      message: "Maximum nights must be greater than or equal to minimum nights",
      path: ["maxNights"],
    }
  );

export type RetreatInstanceFormData = z.infer<typeof retreatInstanceFormSchema>;
