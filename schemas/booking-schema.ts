import { z } from "zod";

export const bookingFormSchema = z.object({
  checkInDate: z.string(),
  checkOutDate: z.string(),
  guestCount: z.number().min(1),
  propertyId: z.string().optional(),
  retreatInstanceId: z.string().optional(),
  programInstanceId: z.string().optional(),
  status: z.string(),
  totalPrice: z.string(),
  userId: z.string(),
  hostId: z.string(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;
