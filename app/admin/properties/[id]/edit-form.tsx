"use client";

import React, { useEffect, useState } from "react";
import { getPropertyById, updateProperty } from "@/actions/property-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  id: z.string(),
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
  // Relationship fields (included in schema but not in form UI)
  //   host: z.object({}).optional(),
  //   reviews: z.array(z.object({})),
  //   images: z.array(z.object({})),
  //   retreats: z.array(z.object({})),
  //   rooms: z.array(z.object({})),
  //   programs: z.array(z.object({})),
  //   amenities: z.array(z.object({})),
});

type PropertyFormValues = z.infer<typeof formSchema>;

export function PropertyEditForm({ propertyId }: { propertyId: string }) {
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: propertyId,
      email: "",
      phone: "",
      name: "",
      descShort: "",
      descList: "",
      lat: 0,
      lng: 0,
      coordType: "",
      city: "",
      address: "",
      addressRaw: "",
      nearbyAirport: "",
      placeList: "",
      policyList: "",
      tagList: "",
      location: "",
      type: "",
      amenityHealing: "",
      amenityCuisine: "",
      amenityActivity: "",
      amenityFacility: "",
      rating: "",
      coverImg: "",
      hostId: "",
      verified: undefined,
    },
  });

  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      try {
        const property = await getPropertyById(propertyId);
        if (property) {
          //@ts-ignore TODO: remove ts-ignore after completing rest of form.
          form.reset(property);
        }
      } catch (error) {
        console.error("Failed to fetch property:", error);
      }
      setIsLoading(false);
    };

    fetchProperty();
  }, [propertyId, form]);

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      await updateProperty(propertyId, data);
      // Handle successful update (e.g., show a success message)
    } catch (error) {
      console.error("Failed to update property:", error);
      // Handle error (e.g., show an error message)
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descShort"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descList"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description List</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="basis-1/3">
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lat"
            render={({ field }) => (
              <FormItem className="basis-1/3">
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lng"
            render={({ field }) => (
              <FormItem className="basis-1/3">
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                This address is displayed on property profile
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="addressRaw"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raw Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>The scraped address value</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nearbyAirport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nearby Airport</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="placeList"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Place List</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="policyList"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Policy List</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tagList"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag List</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>Tags should separated by {"|"}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amenityHealing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Healing</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amenityCuisine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cuisine</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amenityActivity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amenityFacility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facility</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <Input disabled {...field} />
              </FormControl>
              <FormDescription>
                This feature is not implemented yet.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coverImg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Image selection not yet implemented.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>E.g., Resort, Hotel, etc.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Add more form fields for other properties */}
        <Button type="submit">Update Property</Button>
      </form>
    </Form>
  );
}
