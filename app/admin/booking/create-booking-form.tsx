"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBooking } from "@/actions/booking-actions";

const formSchema = z.object({
    propertyId: z.string().min(1, { message: "Property ID is required." }),
    checkInDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid check-in date." }),
    checkOutDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid check-out date." }),
    guestCount: z.number().min(1, { message: "Guest count must be at least 1." }),
    totalPrice: z.string().min(1, { message: "Total price is required." }),
    status: z.enum(["pending", "confirmed", "cancelled"]),
    userId: z.string().min(1, { message: "User ID is required." }),
});

export function CreateBookingForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            propertyId: "",
            checkInDate: "",
            checkOutDate: "",
            guestCount: 1,
            totalPrice: "",
            status: "pending",
            userId: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const booking = await createBooking({
                ...values,
                checkInDate: new Date(values.checkInDate),
                checkOutDate: new Date(values.checkOutDate),
                guestCount: Number(values.guestCount),
            });
            console.log("Booking created:", booking);
            form.reset(); // Reset form after successful submission
            // TODO: Add success message or redirect
        } catch (error) {
            console.error("Error creating booking:", error);
            // TODO: Add error message
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
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
                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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