import { z } from "zod";

export const bookingFormSchema = z.object({
  checkInDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid check-in date",
  }),
  checkOutDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid check-out date",
  }),
  guestCount: z.number().min(1),
  totalPrice: z.string(),
  status: z.string(),
  userId: z.string(),
  hostId: z.string(), // Add required hostId
  propertyId: z.string().optional(),
  retreatInstanceId: z.string().optional(),
  programInstanceId: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;
