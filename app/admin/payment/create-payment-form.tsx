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
import { createPayment } from "@/actions/payment-actions"; // Adjust this import path as needed

const formSchema = z.object({
    bookingId: z.string().min(1, { message: "Booking ID is required." }),
    paymentDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date." }),
    amount: z.string().min(1, { message: "Amount is required." }),
    status: z.enum(["pending", "completed", "failed"], {
        required_error: "Please select a payment status."
    }),
});

export function CreatePaymentForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bookingId: "",
            paymentDate: "",
            amount: "",
            status: "pending",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const payment = await createPayment({
                ...values,
                paymentDate: new Date(values.paymentDate),
            });
            console.log("Payment created:", payment);
            form.reset(); // Reset form after successful submission
            // TODO: Add success message or redirect
        } catch (error) {
            console.error("Error creating payment:", error);
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
                    name="bookingId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Booking ID</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter booking ID" {...field} />
                            </FormControl>
                            <FormDescription>
                                The ID of the booking this payment is for.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter amount" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the payment amount (e.g., 100.00).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Payment"}
                </Button>
            </form>
        </Form>
    );
}