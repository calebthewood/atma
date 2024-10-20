"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getHosts } from "@/actions/host-actions";
import { getProperties } from "@/actions/property-actions";
import {
  createRetreat,
  getRetreatById,
  updateRetreat,
} from "@/actions/retreat-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Host, Property, Retreat } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  bookingType: z.enum(["Flexible", "Fixed", "Open"]),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  desc: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." }),
  duration: z.string().min(1, { message: "Duration is required." }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format.",
  }),
  priceList: z.string().min(1, { message: "Price list is required." }),
  minGuests: z.number().int().min(1),
  maxGuests: z.number().int().min(-1),
  coverImg: z
    .string()
    .url({ message: "Invalid URL for cover image." })
    .optional(),
  sourceUrl: z.string().url({ message: "Invalid source URL." }).optional(),
  hostId: z.string().min(1, { message: "Host is required." }),
  propertyId: z.string().min(1, { message: "Property is required." }),
});

type FormData = z.infer<typeof formSchema>;

export function RetreatForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const params = useParams();
  const router = useRouter();
  const retreatId = params.id as string | undefined;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingType: "Flexible",
      name: "",
      desc: "",
      duration: "",
      date: "",
      priceList: "",
      minGuests: 1,
      maxGuests: -1,
      coverImg: "",
      sourceUrl: "",
      hostId: "",
      propertyId: "",
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedHosts, fetchedProperties] = await Promise.all([
          getHosts(),
          getProperties(),
        ]);
        setHosts(fetchedHosts);
        setProperties(fetchedProperties);

        if (retreatId) {
          setIsEditing(true);
          const retreat = await getRetreatById(retreatId);
          if (retreat) {
            const formData: Partial<FormData> = {
              bookingType: retreat.bookingType as "Flexible" | "Fixed" | "Open",
              name: retreat.name || "",
              desc: retreat.desc || "",
              duration: retreat.duration || "",
              date: retreat.date
                ? retreat.date.toISOString().split("T")[0]
                : "",
              priceList: retreat.priceList || "",
              minGuests: retreat.minGuests || 1,
              maxGuests: retreat.maxGuests || -1,
              coverImg: retreat.coverImg || "",
              sourceUrl: retreat.sourceUrl || "",
              hostId: retreat.hostId || "",
              propertyId: retreat.propertyId,
            };
            form.reset(formData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // TODO: Handle error (e.g., show error message to user)
      }
    }

    fetchData();
  }, [retreatId, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      let retreat;
      if (isEditing && retreatId) {
        retreat = await updateRetreat(retreatId, values);
      } else {
        retreat = await createRetreat(values);
      }
      console.log(isEditing ? "Retreat updated:" : "Retreat created:", retreat);
      router.push("/retreats"); // Redirect to retreats list page
    } catch (error) {
      console.error(
        isEditing ? "Error updating retreat:" : "Error creating retreat:",
        error
      );
      // TODO: Add error message
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retreat Name</FormLabel>
              <FormControl>
                <Input placeholder="Yoga Retreat 2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the retreat..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bookingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Booking Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select booking type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Flexible">Flexible</SelectItem>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div> </div>
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input placeholder="7 days" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priceList"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price List</FormLabel>
              <FormControl>
                <Input placeholder="1000,1500,2000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minGuests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Guests</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxGuests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Guests</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sourceUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/retreat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hostId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Host</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a host" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {hosts.map((host) => (
                    <SelectItem key={host.id} value={host.id}>
                      {host.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="propertyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Submitting..."
            : isEditing
              ? "Update Retreat"
              : "Create Retreat"}
        </Button>
      </form>
    </Form>
  );
}
