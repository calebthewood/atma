"use client";

import { useEffect } from "react";
import { createAmenity, updateAmenity } from "@/actions/amenity";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Amenity } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn, toKebabCase } from "@/lib/utils";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

// Validation schema
const amenityFormSchema = z.object({
  type: z.enum(["activity", "amenity"]),
  categoryValue: z.string().optional(),
  categoryName: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
  custom: z.boolean().default(false),
});

type AmenityFormData = z.infer<typeof amenityFormSchema>;

type AmenityFormProps = {
  amenity?: Amenity;
};

// BB can change these!!
const CATEGORIES = {
  activity: [
    {
      value: "cultural-creative-activities",
      name: "Cultural & Creative Activities",
    },
    {
      value: "fitness-physical-activities",
      name: "Fitness & Physical Activities",
    },
    { value: "mind-body-practice", name: "Mind-Body Practice" },
    {
      value: "outdoor-adventure-activities",
      name: "Outdoor & Adventure Activities",
    },
  ],
  amenity: [
    {
      value: "business-conference-services",
      name: "Business & Conference Services",
    },
    { value: "connectivity-technology", name: "Connectivity & Technology" },
    { value: "event-celebration-spaces", name: "Event & Celebration Spaces" },
    {
      value: "family-children-facilities",
      name: "Family & Children Facilities",
    },
    { value: "fitness-sports-facilities", name: "Fitness & Sports Facilities" },
    { value: "food-drink", name: "Food & Drink" },
    { value: "guest-services-concierge", name: "Guest Services & Concierge" },
    { value: "parking-transportation", name: "Parking & Transportation" },
    { value: "public-areas-leisure", name: "Public Areas & Leisure" },
    { value: "safety-security", name: "Safety & Security" },
    { value: "sleep-amenities", name: "Sleep Amenities" },
    { value: "swimming-water-facilities", name: "Swimming & Water Facilities" },
    { value: "wellness-spa", name: "Wellness & Spa" },
  ],
} as const;

export function AmenityForm({ amenity }: AmenityFormProps) {
  const form = useForm<AmenityFormData>({
    resolver: zodResolver(amenityFormSchema),
    defaultValues: {
      type: (amenity?.type as "activity" | "amenity") || "activity",
      categoryValue: amenity?.categoryValue || "",
      categoryName: amenity?.categoryName || "",
      name: amenity?.name || "",
      value: amenity?.value || "",
      custom: amenity?.custom || false,
    },
  });

  // Generate value from name
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name") {
        const nameValue = value.name;
        if (nameValue) {
          form.setValue("value", toKebabCase(nameValue));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Update category name when value changes
  useEffect(() => {
    const type = form.watch("type");
    const categoryValue = form.watch("categoryValue");

    if (categoryValue) {
      const category = CATEGORIES[type]?.find(
        (cat) => cat.value === categoryValue
      );
      if (category) {
        form.setValue("categoryName", category.name);
      }
    }
  }, [form.watch("categoryValue"), form.watch("type")]);

  const onSubmit = async (data: AmenityFormData) => {
    try {
      if (amenity) {
        await updateAmenity(amenity.id, data);
        toast({
          title: "Success",
          description: "Amenity updated successfully",
        });
      } else {
        await createAmenity(data);
        form.reset();
        toast({
          title: "Success",
          description: "Amenity created successfully",
        });
      }
    } catch (error) {
      console.error("Failed to save amenity:", error);
      toast({
        title: "Error",
        description: "Failed to save amenity",
        variant: "destructive",
      });
    }
  };

  const getFieldStyles = (fieldName: keyof AmenityFormData) => {
    const isSubmitting = form.formState.isSubmitting;
    const isValid = !form.formState.errors[fieldName];
    const isDirty = form.formState.dirtyFields[fieldName];

    return cn("transition-colors duration-300", {
      "border-atma-yellow": isSubmitting,
      "border-atma-mint": isValid && isDirty && !isSubmitting,
      "border-atma-red": !isValid && !isSubmitting,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex w-full gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset category when type changes
                    form.setValue("categoryValue", "");
                    form.setValue("categoryName", "");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={getFieldStyles("type")}>
                      <SelectValue placeholder="Select amenity type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="amenity">Amenity</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className={getFieldStyles("categoryValue")}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES[form.watch("type")]?.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Yoga, Sauna"
                  className={getFieldStyles("name")}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The name that will be displayed to users
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., yoga, sauna"
                  className={getFieldStyles("value")}
                  {...field}
                  disabled // Auto-generated from name
                />
              </FormControl>
              <FormDescription>
                Auto-generated from name in kebab-case format
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="custom"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Custom Amenity</FormLabel>
                <FormDescription>
                  {`Mark this as a custom amenity if it's specific to a single
                  entity`}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className={cn({
            "bg-atma-yellow text-black":
              form.formState.isSubmitting || form.formState.isDirty,
            "bg-atma-mint text-black": form.formState.isSubmitSuccessful,
          })}
        >
          {form.formState.isSubmitting
            ? "Saving..."
            : amenity
              ? "Update Amenity"
              : "Create Amenity"}
        </Button>
      </form>
    </Form>
  );
}
