"use client";

import { useState } from "react";
import { BookingWithDetails, createBooking } from "@/actions/booking-actions";
import { zodResolver } from "@hookform/resolvers/zod";
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

const formSchema = z.object({
  checkInDate: z.string(),
  checkOutDate: z.string(),
  guestCount: z.string(), // Keep as string for form handling
  propertyId: z.string(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
  totalPrice: z.string(),
  userId: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export function BookingForm({ booking }: { booking: BookingWithDetails }) {
  // Add property prop
  const [isSubmitting, setIsSubmitting] = useState(false);
  const property =
    booking.programInstance?.program.property ||
    booking.retreatInstance?.retreat.property;
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "pending",
      guestCount: "1",
      propertyId: property?.id,
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const booking = await createBooking({
        ...values,
        checkInDate: new Date(values.checkInDate).toDateString(),
        checkOutDate: new Date(values.checkOutDate).toDateString(),
        guestCount: Number(values.guestCount),
        hostId: property?.hostId || "", // Add the hostId from the property
      });

      if (booking.success) {
        form.reset();
        // Handle success (e.g., show toast, redirect)
      } else {
        // Handle error from the server action
        console.error("Failed to create booking:", booking.error);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-md space-y-8"
      >
        <FormField
          control={form.control}
          name="propertyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property ID</FormLabel>
              <FormControl>
                <Input placeholder="Property ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="checkInDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check-in Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="checkOutDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check-out Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="guestCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guest Count</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="totalPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Price</FormLabel>
              <FormControl>
                <Input placeholder="Total Price" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User ID</FormLabel>
              <FormControl>
                <Input placeholder="User ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Booking"}
        </Button>
      </form>
    </Form>
  );
}
