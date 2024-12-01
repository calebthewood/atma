"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHosts } from "@/actions/host-actions";
import { getProperties } from "@/actions/property-actions";
import {
  createRetreat,
  RetreatWithoutNulls,
  updateRetreat,
} from "@/actions/retreat-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Host, Property } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const categories = [
  "Ayurveda",
  "Couples & Relationships",
  "Creative & Artistic",
  "Detox & Cleanse",
  "Detoxification",
  "Emotional Healing",
  "Family & Group Wellness",
  "Fitness & Active",
  "Healthy Aging",
  "Holistic Wellness & Longevity",
  "Hydrotherapy",
  "Luxury Adventure",
  "Medical Wellness",
  "Meditation",
  "Mental Health & Emotional Wellness",
  "Mindfulness",
  "Motherhood",
  "Nutrition & Wellness Coaching",
  "Optimal Weight",
  "Relaxation",
  "Sleep & Restorative Wellness",
  "Spa",
  "Spiritual & Self-Discovery",
  "Traditional Healing",
  "Therapeutic Fasting",
];

const formSchema = z.object({
  bookingType: z.string(),
  status: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.string(),
  desc: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." }),
  keyBenefits: z.string(),
  programApproach: z.string(),
  whoIsthisFor: z.string(),
  policyCancel: z.string(),
  duration: z.string().min(1, { message: "Duration is required." }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format.",
  }),
  minGuests: z.number().int().min(1),
  maxGuests: z.number().int().min(-1),
  sourceUrl: z.string().optional(),
  hostId: z.string().min(1, { message: "Host is required." }).nullable(),
  propertyId: z.string().min(1, { message: "Property is required." }),
});

type FormData = z.infer<typeof formSchema>;

type RetreatFormProps = {
  retreat?: RetreatWithoutNulls | null;
};

export function RetreatForm({ retreat }: RetreatFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingType: retreat?.bookingType || "Fixed",
      name: retreat?.name || "",
      category: retreat?.category || "",
      status: retreat?.status ?? "draft",
      desc: retreat?.desc || "",
      keyBenefits: retreat?.keyBenefits,
      programApproach: retreat?.programApproach,
      whoIsthisFor: retreat?.whoIsthisFor,
      policyCancel: retreat?.policyCancel,
      duration: retreat?.duration || "",
      date: retreat?.date ? retreat?.date.toISOString().split("T")[0] : "",
      minGuests: retreat?.minGuests || 1,
      maxGuests: retreat?.maxGuests || -1,
      sourceUrl: retreat?.sourceUrl ?? undefined,
      hostId: retreat?.hostId || "",
      propertyId: retreat?.propertyId,
    },
  });

  const ON_CHANGE_FIELDS = new Set([
    "status",
    "bookingType",
    "minGuests",
    "maxGuests",
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedHosts, fetchedProperties] = await Promise.all([
          getHosts(),
          getProperties(),
        ]);
        setHosts(fetchedHosts);
        setProperties(fetchedProperties);
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
  }, []);

  /** Updates field on blur */
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
      router.push("/admin/retreat");
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-8"
      >
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => {
            const statusConfig = {
              draft: {
                label: "Draft",
                bgColor: "bg-background text-muted-foreground",
                description: "Only visible to admins",
              },
              published: {
                label: "Published",
                bgColor: "bg-primary text-primary-foreground",
                description: "Visible to all users",
              },
              archived: {
                label: "Archived",
                bgColor: "bg-muted text-muted-foreground",
                description: "Hidden from all views",
              },
            };
            return (
              <div className="flex flex-col space-y-2 border-l-4 p-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none">
                    Status
                  </label>
                  <div
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-medium",
                      statusConfig[field.value as keyof typeof statusConfig]
                        ?.bgColor
                    )}
                  >
                    {
                      statusConfig[field.value as keyof typeof statusConfig]
                        ?.label
                    }
                  </div>
                </div>
                <Select
                  defaultValue={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleFieldBlur("status");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([value, config]) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className="items-center gap-x-4"
                      >
                        <span>{config.label}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {config.description}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }}
        />
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Retreat Overview</CardTitle>
          </CardHeader>
          <CardContent>
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
              name="hostId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={getFieldStyles("hostId")}>
                    Host
                  </FormLabel>
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
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={getFieldStyles("category")}>
                    Retreat Category
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldBlur("category");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={getFieldStyles("category")}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category, i) => (
                        <SelectItem key={`category-${i}`} value={category}>
                          {category}
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
                    Flexible: Fixed Start Open End. Fixed: Fixed Start Fixed
                    End. Open: Open Start Open End
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
                    <FormDescription>
                      Use -1 for unlimited guests
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        {/* Retreat Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Retreat Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={getFieldStyles("desc")}>
                    Overview
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
              name="keyBenefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={getFieldStyles("keyBenefits")}>
                    Key Benefits
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className={getFieldStyles("keyBenefits")}
                      placeholder="Describe key benefits..."
                      {...field}
                      onBlur={() => handleFieldBlur("keyBenefits")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="programApproach"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={getFieldStyles("programApproach")}>
                    Program Approach
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className={getFieldStyles("programApproach")}
                      placeholder="Describe program approach..."
                      {...field}
                      onBlur={() => handleFieldBlur("programApproach")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whoIsthisFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={getFieldStyles("whoIsthisFor")}>
                    Who is this for?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className={getFieldStyles("whoIsthisFor")}
                      placeholder="Describe who this is for..."
                      {...field}
                      onBlur={() => handleFieldBlur("whoIsthisFor")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="policyCancel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={getFieldStyles("policyCancel")}>
                    Cancellation policy
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className={getFieldStyles("policyCancel")}
                      placeholder="Describe cancellation policy..."
                      {...field}
                      onBlur={() => handleFieldBlur("policyCancel")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

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
