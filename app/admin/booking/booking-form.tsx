"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookingWithAllRelations,
  createBooking,
  updateBooking,
} from "@/actions/booking-actions";
import { BookingFormData, bookingFormSchema } from "@/schemas/booking-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

type BookingFormProps = {
  booking?: BookingWithAllRelations;
};

export function BookingForm({ booking }: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const property =
    booking?.programInstance?.program.property ||
    booking?.retreatInstance?.retreat.property;

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      checkInDate: booking?.checkInDate
        ? new Date(booking.checkInDate).toISOString().split("T")[0]
        : "",
      checkOutDate: booking?.checkOutDate
        ? new Date(booking.checkOutDate).toISOString().split("T")[0]
        : "",
      guestCount: booking?.guestCount || 1,
      propertyId: booking?.propertyId || property?.id,
      retreatInstanceId: booking?.retreatInstanceId || undefined,
      programInstanceId: booking?.programInstanceId || undefined,
      status: booking?.status || "pending",
      totalPrice: booking?.totalPrice || "",
      userId: booking?.userId || "",
      hostId: booking?.hostId || property?.hostId || "",
    },
  });

  // Fields that should update on change rather than blur
  const ON_CHANGE_FIELDS = new Set(["status", "guestCount"]);

  // Update fields on blur when editing
  useEffect(() => {
    if (!booking) return;

    const subscription = form.watch(async (value, { name, type }) => {
      if (
        name &&
        form.formState.dirtyFields[name] &&
        !form.formState.isSubmitting &&
        (type === "blur" || (type === "change" && ON_CHANGE_FIELDS.has(name)))
      ) {
        try {
          await handleFieldBlur(name as keyof BookingFormData);
        } catch (error) {
          console.error(`Error updating ${name}:`, error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [booking, form]);

  const handleFieldBlur = async (fieldName: keyof BookingFormData) => {
    if (!booking) return;

    try {
      const fieldValue = form.getValues(fieldName);
      const result = await updateBooking(booking.id, {
        [fieldName]: fieldValue,
      });

      if (!result.ok) {
        throw new Error(result.message);
      }

      toast({
        title: "Updated",
        description: `${fieldName} has been updated.`,
      });
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);

      toast({
        title: "Error",
        description: `Failed to update ${fieldName}. Please try again.`,
        variant: "destructive",
      });

      form.setError(fieldName, {
        type: "manual",
        message: "Update failed",
      });
    }
  };

  const getFieldStyles = (fieldName: keyof BookingFormData) => {
    const isSubmitting = form.formState.isSubmitting;
    const isValid = !form.formState.errors[fieldName];
    const isDirty = form.formState.dirtyFields[fieldName];

    return cn("transition-colors duration-300", {
      "border-yellow-500": isSubmitting,
      "border-green-500": isValid && isDirty && !isSubmitting,
      "border-red-500": !isValid && !isSubmitting,
    });
  };

  async function onSubmit(values: BookingFormData) {
    setIsLoading(true);
    try {
      if (booking) {
        const result = await updateBooking(booking.id, values);
        if (!result.ok) {
          throw new Error(result.message);
        }
        toast({
          title: "Success",
          description: "Booking updated successfully.",
        });
      } else {
        const result = await createBooking(values);
        if (!result.ok) {
          throw new Error(result.message);
        }
        toast({
          title: "Success",
          description: "Booking created successfully.",
        });
      }
      form.reset(values);
      router.push("/admin/booking");
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save booking",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing form fields with updated styling and blur handlers */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={getFieldStyles("status")}>
                        <SelectValue placeholder="Select status" />
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
            {/* Rest of your form fields following the same pattern */}
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isLoading}
          className={cn({
            "bg-yellow-500": isLoading || form.formState.isDirty,
            "bg-green-500": form.formState.isSubmitSuccessful,
          })}
        >
          {isLoading
            ? "Saving..."
            : booking
              ? "Update Booking"
              : "Create Booking"}
        </Button>
      </form>
    </Form>
  );
}
