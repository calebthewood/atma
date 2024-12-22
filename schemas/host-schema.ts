// schemas/host-schema.ts
import { z } from "zod";

// Define host types as a constant for reuse
export const HOST_TYPES = [
  "Corporate",
  "Independent",
  "Agency",
  "Individual",
] as const;

export const hostFormSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters." })
      .max(100, { message: "Name must be less than 100 characters." }),

    type: z.enum(HOST_TYPES, {
      required_error: "Please select a host type.",
      invalid_type_error: "That's not a valid host type.",
    }),

    desc: z
      .string()
      .min(10, { message: "Description must be at least 10 characters." })
      .max(2000, { message: "Description must be less than 2000 characters." })
      .nullable()
      .optional(),

    email: z
      .string()
      .email({ message: "Please enter a valid email address." })
      .nullable()
      .optional(),

    phone: z.string().nullable().optional(),

    profilePic: z
      .string()
      .url({ message: "Please enter a valid URL for the profile picture." })
      .nullable()
      .optional(),

    coverImg: z
      .string()
      .url({ message: "Please enter a valid URL for the cover image." })
      .nullable()
      .optional(),

    thumbnail: z
      .string()
      .url({ message: "Please enter a valid URL for the thumbnail." })
      .nullable()
      .optional(),

    userId: z
      .string()
      .min(1, { message: "User ID is required." })
      .nullable()
      .optional(),

    verified: z.date().nullable().optional(),
  })
  .refine(
    (data) => {
      // At least one contact method (email or phone) must be provided
      return data.email || data.phone;
    },
    {
      message: "At least one contact method (email or phone) must be provided",
      path: ["email", "phone"], // This will show the error on both fields
    }
  );

export type HostFormData = z.infer<typeof hostFormSchema>;
