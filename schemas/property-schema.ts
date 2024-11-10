import { z } from "zod";

export const propertyFormSchema = z.object({
  id: z.string().optional(),
  status: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  descShort: z.string(),
  descList: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  coordType: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  addressRaw: z.string().optional(),
  nearbyAirport: z.string().optional(),
  placeList: z.string().optional(),
  policyList: z.string().optional(),
  tagList: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  amenityHealing: z.string().optional(),
  amenityCuisine: z.string().optional(),
  amenityActivity: z.string().optional(),
  amenityFacility: z.string().optional(),
  rating: z.string().optional(),
  coverImg: z.string().optional(),
  hostId: z.string().optional(),
  verified: z.date().optional(),
  checkInTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Please enter a valid time in HH:MM format",
    })
    .optional(),
  checkOutTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Please enter a valid time in HH:MM format",
    })
    .optional(),
  frontDeskHours: z
    .string()
    .refine(
      (val) => {
        if (val === "24/7") return true;
        const timeFormat =
          /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeFormat.test(val);
      },
      {
        message:
          "Please enter valid desk hours in HH:MM-HH:MM format or select 24/7",
      }
    )
    .optional(),
  childrenAllowed: z.boolean().optional(),
  additionalFeeForChildren: z
    .number()
    .min(0, { message: "Fee cannot be negative" })
    .optional(),
  extraBeds: z.boolean().optional(),
  extraBedFee: z
    .number()
    .min(0, { message: "Fee cannot be negative" })
    .optional(),
  breakFastProvided: z.boolean(),
  breakfastType: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const validTypes = ["buffet", "gluten-free", "vegan", "vegetarian"];
        return val
          .toLowerCase()
          .split(",")
          .every((type) => validTypes.includes(type.trim()));
      },
      {
        message: "Invalid breakfast type selection",
      }
    ),
  breakfastFeeAdult: z
    .number()
    .min(0, { message: "Fee cannot be negative" })
    .optional(),
  breakfastFeeChild: z
    .number()
    .min(0, { message: "Fee cannot be negative" })
    .optional(),
  breakfastIncluded: z.boolean().optional(),
  depositRequired: z.boolean().optional(),
  depositMethods: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const validMethods = ["credit-card", "debit-card", "cash"];
        return val
          .split(",")
          .every((method) => validMethods.includes(method.trim()));
      },
      {
        message: "Invalid deposit method selection",
      }
    ),
  paymentMethods: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const validMethods = [
          "jcb",
          "union-pay",
          "visa",
          "mastercard",
          "american-express",
          "cash",
          "debit-card",
        ];
        return val
          .split(",")
          .every((method) => validMethods.includes(method.trim()));
      },
      {
        message: "Invalid payment method selection",
      }
    ),
  petsAllowed: z.boolean().optional(),
  serviceAnimalsAllowed: z.boolean().optional(),
  minAgeForPrimary: z
    .number()
    .min(18, { message: "Minimum age must be at least 18" })
    .max(100, { message: "Please enter a valid age" })
    .optional(),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;
