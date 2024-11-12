"use client";

import { useState } from "react";
import { createHostUser } from "@/actions/host-user-actions"; // Adjust this import path as needed
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

const formSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required." }),
  hostId: z.string().min(1, { message: "Host ID is required." }),
  assignedBy: z.string().min(1, { message: "Assigned By is required." }),
});

export function CreateHostUserForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      hostId: "",
      assignedBy: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const hostUser = await createHostUser(values);
      console.log("HostUser created:", hostUser);
      form.reset(); // Reset form after successful submission
      // TODO: Add success message or redirect
    } catch (error) {
      console.error("Error creating hostUser:", error);
      // TODO: Add error message
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
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User ID</FormLabel>
              <FormControl>
                <Input placeholder="User ID" {...field} />
              </FormControl>
              <FormDescription>
                Enter the ID of the user to be associated with the host.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hostId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Host ID</FormLabel>
              <FormControl>
                <Input placeholder="Host ID" {...field} />
              </FormControl>
              <FormDescription>
                Enter the ID of the host to associate with the user.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="assignedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned By</FormLabel>
              <FormControl>
                <Input placeholder="Assigned By" {...field} />
              </FormControl>
              <FormDescription>
                Enter the ID or name of the person assigning this host-user
                relationship.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Host User"}
        </Button>
      </form>
    </Form>
  );
}
