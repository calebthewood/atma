"use client";

import { useEffect, useState } from "react";
import {
  createPriceMod,
  getPriceMod,
  updatePriceMod,
} from "@/actions/price-mods";
import { zodResolver } from "@hookform/resolvers/zod";
import { PriceMod } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  desc: z.string().optional(),
  type: z.enum(["FIXED", "PERCENT"]),
  //   category: z.string().min(1, { message: "Category is required" }),
  value: z.number().int(),
  dateRange: z.string().default("all"),
  guestRange: z.string().default("all"),
  roomType: z.string().default("all"),
  hostId: z.string().optional().nullable(),
  propertyId: z.string().optional().nullable(),
  programId: z.string().optional().nullable(),
  retreatId: z.string().optional().nullable(),
  retreatInstanceId: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

type PriceModFormProps = {
  recordId?: string;
  recordType: "host" | "property" | "program" | "retreat" | "retreatInstance";
  priceMod?: PriceMod | null;
};

const ROOM_TYPES = [
  { value: "all", label: "All Rooms" },
  { value: "single", label: "Single Room" },
  { value: "double", label: "Double Room" },
  { value: "suite", label: "Suite" },
];

export function PriceModForm({
  recordId,
  recordType,
  priceMod,
}: PriceModFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: priceMod?.name || "",
      desc: priceMod?.desc || "",
      type: (priceMod?.type as "FIXED" | "PERCENT") || "FIXED",
      value: priceMod?.value || 0,
      dateRange: priceMod?.dateRange || "all",
      guestRange: priceMod?.guestRange || "all",
      roomType: priceMod?.roomType || "all",
      hostId: priceMod?.hostId || null,
      propertyId: priceMod?.propertyId || null,
      programId: priceMod?.programId || null,
      retreatId: priceMod?.retreatId || null,
      retreatInstanceId: priceMod?.retreatInstanceId || null,
    },
  });

  const ON_CHANGE_FIELDS = new Set(["type", "category", "roomType"]);

  useEffect(() => {
    if (!priceMod) return;

    const subscription = form.watch(async (value, { name, type }) => {
      if (
        name &&
        form.formState.dirtyFields[name] &&
        !form.formState.isSubmitting &&
        (type === "blur" || (type === "change" && ON_CHANGE_FIELDS.has(name)))
      ) {
        try {
          await handleFieldBlur(name as keyof FormData);
        } catch (error) {
          console.error(`Error updating ${name}:`, error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [priceMod, form]);

  const handleFieldBlur = async (fieldName: keyof FormData) => {
    if (!priceMod) return;

    try {
      const fieldValue = form.getValues(fieldName);
      await updatePriceMod(priceMod.id, { [fieldName]: fieldValue });

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

  const getFieldStyles = (fieldName: keyof FormData) => {
    const isSubmitting = form.formState.isSubmitting;
    const isValid = !form.formState.errors[fieldName];
    const isDirty = form.formState.dirtyFields[fieldName];

    return cn("transition-colors duration-300", {
      "border-atma-yellow ": isSubmitting,
      "border-atma-mint": isValid && isDirty && !isSubmitting,
      "border-atma-red ": !isValid && !isSubmitting,
    });
  };

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    try {
      // Add the recordId to the appropriate field based on recordType
      const relationField = `${recordType}Id` as keyof FormData;
      const submitData = {
        ...values,
        [relationField]: recordId,
      };

      if (priceMod) {
        await updatePriceMod(priceMod.id, submitData);
        toast({
          title: "Success",
          description: "Price modification updated successfully.",
        });
      } else {
        await createPriceMod(submitData);
        toast({
          title: "Success",
          description: "Price modification created successfully.",
        });
      }
      form.reset(values);
    } catch (error) {
      console.error("Error submitting price mod:", error);
      toast({
        title: "Error",
        description: "Failed to save price modification. Please try again.",
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("name")}>Name</FormLabel>
              <FormControl>
                <Input
                  className={getFieldStyles("name")}
                  placeholder="e.g., High Season Surcharge"
                  {...field}
                  onBlur={() => handleFieldBlur("name")}
                />
              </FormControl>
              <FormDescription>
                This will appear in the booking component
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("desc")}>
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  className={getFieldStyles("desc")}
                  placeholder="Additional information or terms..."
                  {...field}
                  onBlur={() => handleFieldBlur("desc")}
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
              <FormLabel className={getFieldStyles("type")}>Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleFieldBlur("type");
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className={getFieldStyles("type")}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  <SelectItem value="PERCENT">Percentage</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("value")}>Value</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className={getFieldStyles("value")}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  onBlur={() => handleFieldBlur("value")}
                />
              </FormControl>
              <FormDescription>
                {form.watch("type") === "PERCENT"
                  ? "Enter percentage value"
                  : "Enter amount in cents"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("dateRange")}>
                Date Range
              </FormLabel>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  className={getFieldStyles("dateRange")}
                  value={field.value.split(",")[0] || ""}
                  onChange={(e) => {
                    const endDate = field.value.split(",")[1] || "";
                    field.onChange(
                      `${e.target.value}${endDate ? "," + endDate : ""}`
                    );
                  }}
                />
                <Input
                  type="date"
                  className={getFieldStyles("dateRange")}
                  value={field.value.split(",")[1] || ""}
                  onChange={(e) => {
                    const startDate = field.value.split(",")[0] || "";
                    field.onChange(
                      `${startDate}${e.target.value ? "," + e.target.value : ""}`
                    );
                  }}
                />
              </div>
              <FormDescription>Leave empty for all dates</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guestRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("guestRange")}>
                Guest Range
              </FormLabel>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  className={getFieldStyles("guestRange")}
                  placeholder="Min guests"
                  value={field.value.split(",")[0] || ""}
                  onChange={(e) => {
                    const max = field.value.split(",")[1] || "";
                    field.onChange(`${e.target.value}${max ? "," + max : ""}`);
                  }}
                />
                <Input
                  type="number"
                  className={getFieldStyles("guestRange")}
                  placeholder="Max guests"
                  value={field.value.split(",")[1] || ""}
                  onChange={(e) => {
                    const min = field.value.split(",")[0] || "";
                    field.onChange(
                      `${min}${e.target.value ? "," + e.target.value : ""}`
                    );
                  }}
                />
              </div>
              <FormDescription>
                Leave empty for all guest counts
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roomType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("roomType")}>
                Room Type
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleFieldBlur("roomType");
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className={getFieldStyles("roomType")}>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ROOM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className={cn({
            "bg-atma-yellow text-black": isLoading || form.formState.isDirty,
            "bg-atma-mint text-black": form.formState.isSubmitSuccessful,
          })}
        >
          {isLoading
            ? "Submitting..."
            : priceMod
              ? "Update Price Modification"
              : "Create Price Modification"}
        </Button>
      </form>
    </Form>
  );
}
