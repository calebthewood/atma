"use client";

import React, { useCallback, useEffect, useState } from "react";
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

import { StatusField } from "../status-form-field";

const formSchema = z.object({
  bookingType: z.enum(["Flexible", "Fixed", "Open"]),
  status: z.string().optional(),
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
  hostId: z.string().min(1, { message: "Host is required." }).nullable(),
  propertyId: z.string().min(1, { message: "Property is required." }),
});

type FormData = z.infer<typeof formSchema>;

export function RetreatForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [retreat, setRetreat] = useState<Retreat | null>(null);

  const params = useParams();
  const router = useRouter();
  const retreatId = params.id as string | undefined;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingType: "Flexible",
      name: "",
      status: retreat?.status || "draft",
      desc: "",
      duration: "",
      date: "",
      priceList: "",
      minGuests: 1,
      maxGuests: -1,
      sourceUrl: "",
      hostId: "",
      propertyId: "",
    },
  });

  const ON_CHANGE_FIELDS = new Set(["bookingType", "minGuests", "maxGuests"]);

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
          const fetchedRetreat = await getRetreatById(retreatId);
          if (fetchedRetreat) {
            setRetreat(fetchedRetreat);
            const formData: Partial<FormData> = {
              bookingType: fetchedRetreat.bookingType as
                | "Flexible"
                | "Fixed"
                | "Open",
              name: fetchedRetreat.name || "",
              desc: fetchedRetreat.desc || "",
              duration: fetchedRetreat.duration || "",
              date: fetchedRetreat.date
                ? fetchedRetreat.date.toISOString().split("T")[0]
                : "",
              priceList: fetchedRetreat.priceList || "",
              minGuests: fetchedRetreat.minGuests || 1,
              maxGuests: fetchedRetreat.maxGuests || -1,
              coverImg: fetchedRetreat.coverImg || "",
              sourceUrl: fetchedRetreat?.sourceUrl ?? "",
              hostId: fetchedRetreat.hostId || "",
              propertyId: fetchedRetreat.propertyId,
            };
            form.reset(formData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data. Please try again.",
          variant: "destructive",
        });
      }
    }

    fetchData();
  }, [retreatId, form]);

  useEffect(() => {
    if (!retreat) return;

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
  }, [retreat, form]);

  const handleFieldBlur = async (fieldName: keyof FormData) => {
    if (!retreat) return;

    try {
      const fieldValue = form.getValues(fieldName);
      await updateRetreat(retreat.id, { [fieldName]: fieldValue });

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
      "border-atma-yellow": isSubmitting,
      "border-atma-mint": isValid && isDirty && !isSubmitting,
      "border-atma-red": !isValid && !isSubmitting,
    });
  };

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    try {
      if (retreat) {
        await updateRetreat(retreat.id, values);
        toast({
          title: "Success",
          description: "Retreat updated successfully.",
        });
      } else {
        await createRetreat(values);
        toast({
          title: "Success",
          description: "Retreat created successfully.",
        });
      }
      form.reset(values);
      router.push("/admin/retreats");
    } catch (error) {
      console.error("Error submitting retreat:", error);
      toast({
        title: "Error",
        description: "Failed to save retreat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // ... render form fields with getFieldStyles and handleFieldBlur
  // Return JSX remains largely the same but add the style and blur handlers
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-8"
      >
        <StatusField form={form} />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("name")}>
                Retreat Name
              </FormLabel>
              <FormControl>
                <Input
                  className={getFieldStyles("name")}
                  placeholder="Enter retreat name"
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
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("desc")}>
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  className={getFieldStyles("desc")}
                  placeholder="Describe the retreat..."
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
          name="bookingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("bookingType")}>
                Booking Type
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleFieldBlur("bookingType");
                }}
                defaultValue={field.value || "Flexible"}
              >
                <FormControl>
                  <SelectTrigger className={getFieldStyles("bookingType")}>
                    <SelectValue placeholder="Select booking type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Flexible">Flexible</SelectItem>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Flexible: Fixed Start Open End. Fixed: Fixed Start Fixed End.
                Open: Open Start Open End
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("duration")}>
                Duration
              </FormLabel>
              <FormControl>
                <Input
                  className={getFieldStyles("duration")}
                  placeholder="e.g., 7 days"
                  {...field}
                  onBlur={() => handleFieldBlur("duration")}
                />
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
              <FormLabel className={getFieldStyles("date")}>
                Start Date
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className={getFieldStyles("date")}
                  {...field}
                  onBlur={() => handleFieldBlur("date")}
                />
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
              <FormLabel className={getFieldStyles("priceList")}>
                Price List
              </FormLabel>
              <FormControl>
                <Input
                  className={getFieldStyles("priceList")}
                  placeholder="1000,1500,2000"
                  {...field}
                  onBlur={() => handleFieldBlur("priceList")}
                />
              </FormControl>
              <FormDescription>
                Enter prices separated by commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="minGuests"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={getFieldStyles("minGuests")}>
                  Minimum Guests
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className={getFieldStyles("minGuests")}
                    min={1}
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      field.onChange(value);
                      if (ON_CHANGE_FIELDS.has("minGuests")) {
                        handleFieldBlur("minGuests");
                      }
                    }}
                    onBlur={() => handleFieldBlur("minGuests")}
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
                <FormLabel className={getFieldStyles("maxGuests")}>
                  Maximum Guests
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className={getFieldStyles("maxGuests")}
                    min={-1}
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      field.onChange(value);
                      if (ON_CHANGE_FIELDS.has("maxGuests")) {
                        handleFieldBlur("maxGuests");
                      }
                    }}
                    onBlur={() => handleFieldBlur("maxGuests")}
                  />
                </FormControl>
                <FormDescription>Use -1 for unlimited guests</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sourceUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("sourceUrl")}>
                Source URL
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="url"
                  className={getFieldStyles("sourceUrl")}
                  placeholder="https://example.com/retreat"
                  onBlur={() => handleFieldBlur("sourceUrl")}
                />
              </FormControl>
              <FormDescription>
                Original source of the retreat information
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
              <FormLabel className={getFieldStyles("hostId")}>Host</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleFieldBlur("hostId");
                }}
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger className={getFieldStyles("hostId")}>
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
              <FormLabel className={getFieldStyles("propertyId")}>
                Property
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleFieldBlur("propertyId");
                }}
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger className={getFieldStyles("propertyId")}>
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
            : retreat
              ? "Update Retreat"
              : "Create Retreat"}
        </Button>
      </form>
    </Form>
  );
}
