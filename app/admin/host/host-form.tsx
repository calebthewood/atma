// app/admin/host/host-form.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createHost,
  HostWithAllRelations,
  updateHost,
  type HostFormData,
} from "@/actions/host-actions";
import { HOST_TYPES, hostFormSchema } from "@/schemas/host-schema";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

type HostFormProps = {
  host?: HostWithAllRelations;
  userId?: string;
};

export function HostForm({ host, userId }: HostFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<HostFormData>({
    resolver: zodResolver(hostFormSchema),
    defaultValues: {
      name: host?.name || "", //@ts-ignore
      type: host?.type || "Independent",
      desc: host?.desc || "",
      email: host?.email || "",
      phone: host?.phone || "",
      userId: host?.userId || userId,
    },
  });

  // Fields that should update on change rather than blur
  const ON_CHANGE_FIELDS = new Set(["type"]);

  // Update fields on blur when editing
  useEffect(() => {
    if (!host) return;

    const subscription = form.watch(async (value, { name, type }) => {
      if (
        name &&
        form.formState.dirtyFields[name] &&
        !form.formState.isSubmitting &&
        (type === "blur" || (type === "change" && ON_CHANGE_FIELDS.has(name)))
      ) {
        try {
          await handleFieldBlur(name as keyof HostFormData);
        } catch (error) {
          console.error(`Error updating ${name}:`, error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [host, form]);

  const handleFieldBlur = async (fieldName: keyof HostFormData) => {
    if (!host) return;

    try {
      const fieldValue = form.getValues(fieldName);

      // Create a base object that satisfies the schema requirements
      const updateData: HostFormData = {
        name: host.name ?? "", // Required field must have a default
        type: (host.type as HostFormData["type"]) ?? "Independent", // Required field must have a default
        desc: host.desc ?? "",
        email: host.email ?? "",
        phone: host.phone ?? "",
        profilePic: host.profilePic ?? "",
        coverImg: host.coverImg ?? "",
        thumbnail: host.thumbnail ?? "",
        userId: host.userId ?? "",
      };

      // @ts-ignore Update only the changed field
      updateData[fieldName] = fieldValue;

      if (host) {
        const result = await updateHost(host.id, updateData);
        if (!result.ok) {
          throw new Error(result.message);
        }
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

  const getFieldStyles = (fieldName: keyof HostFormData) => {
    const isSubmitting = form.formState.isSubmitting;
    const isValid = !form.formState.errors[fieldName];
    const isDirty = form.formState.dirtyFields[fieldName];

    return cn("transition-colors duration-300", {
      "border-yellow-500": isSubmitting,
      "border-green-500": isValid && isDirty && !isSubmitting,
      "border-red-500": !isValid && !isSubmitting,
    });
  };

  async function onSubmit(values: HostFormData) {
    setIsLoading(true);
    try {
      const result = host
        ? await updateHost(host.id, values)
        : await createHost(values);

      if (!result.ok) {
        throw new Error(result.message);
      }

      toast({
        title: "Success",
        description: host
          ? "Host updated successfully."
          : "Host created successfully.",
      });

      form.reset(values);
      router.push("/admin/host");
    } catch (error) {
      console.error("Error submitting host:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save host",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  console.log("errors", form.formState.errors);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-8"
      >
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host Name</FormLabel>
                  <FormControl>
                    <Input
                      className={getFieldStyles("name")}
                      placeholder="Enter host name"
                      {...field}
                      onBlur={() => handleFieldBlur("name")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (ON_CHANGE_FIELDS.has("type")) {
                        handleFieldBlur("type");
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={getFieldStyles("type")}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HOST_TYPES.map((type, i) => (
                        <SelectItem key={i + type} value={type}>
                          {type}
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
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className={getFieldStyles("desc")}
                      placeholder="Describe the host..."
                      {...field}
                      value={field.value ?? ""}
                      onBlur={() => handleFieldBlur("desc")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className={getFieldStyles("email")}
                      placeholder="email@example.com"
                      {...field}
                      value={field.value ?? ""}
                      onBlur={() => handleFieldBlur("email")}
                    />
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
                    <Input
                      icon="phone"
                      className={getFieldStyles("phone")}
                      placeholder="+1234567890"
                      {...field}
                      value={field.value ?? ""}
                      onBlur={() => handleFieldBlur("phone")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          {isLoading ? "Saving..." : host ? "Update Host" : "Create Host"}
        </Button>
      </form>
    </Form>
  );
}
