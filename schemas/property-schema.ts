import { z } from "zod";

export const propertyFormSchema = z.object({
  id: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  descShort: z.string().optional(),
  descList: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  coordType: z.string().optional(),
  city: z.string().optional(),
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
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;
