"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminPaginatedHosts,
  HostWithBasicRelations,
} from "@/actions/host-actions";
import {
  createProgram,
  updateProgram,
  type ProgramWithAllRelations,
} from "@/actions/program-actions";
import {
  getAdminPaginatedProperties,
  PropertyWithBasicRelations,
} from "@/actions/property-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn, isEmpty } from "@/lib/utils";
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

import { ENTITY_CATEGORIES } from "../entity-categories";

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
  minGuests: z.number().int().min(1),
  maxGuests: z.number().int().min(-1),
  sourceUrl: z.string().optional(),
  hostId: z.string().min(1, { message: "Host is required." }),
  propertyId: z.string().min(1, { message: "Property is required." }),
});

type FormData = z.infer<typeof formSchema>;

type ProgramFormProps = {
  program?: ProgramWithAllRelations;
};
export function ProgramForm({ program }: ProgramFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hosts, setHosts] = useState<HostWithBasicRelations[]>([]);
  const [properties, setProperties] = useState<PropertyWithBasicRelations[]>(
    []
  );

  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingType: program?.bookingType || "Fixed",
      name: program?.name || "",
      category: program?.category || "",
      status: program?.status ?? "draft",
      desc: program?.desc || "",
      keyBenefits: program?.keyBenefits || "",
      programApproach: program?.programApproach || "",
      whoIsthisFor: program?.whoIsthisFor || "",
      policyCancel: program?.policyCancel || "",
      minGuests: program?.minGuests ?? 1,
      maxGuests: program?.maxGuests ?? -1,
      sourceUrl: program?.sourceUrl ?? undefined,
      hostId: program?.hostId || "",
      propertyId: program?.propertyId || "",
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
          getAdminPaginatedHosts(),
          getAdminPaginatedProperties(),
        ]);
        if (fetchedProperties.ok && fetchedProperties.data) {
          const properties = fetchedProperties.data?.items;
          setProperties(properties);
        }
        if (fetchedHosts.ok && fetchedHosts.data) {
          setHosts(fetchedHosts.data.items);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
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
    if (!program) return;
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
          console.log(`Error updating ${name}:`, error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [program, form]);

  const handleFieldBlur = async (fieldName: keyof FormData) => {
    if (!program) return;

    try {
      const fieldValue = form.getValues(fieldName);
      const propertyValue = form.getValues("propertyId");
      const result = await updateProgram(program?.id, {
        [fieldName]: fieldValue,
        propertyId: propertyValue,
      });

      if (!result.ok) {
        throw new Error(result.message);
      }

      toast({
        title: "Updated",
        description: `${fieldName} has been updated.`,
      });
    } catch (error) {
      console.log(`Error updating ${fieldName}:`, error);

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
      let response;

      if (program) {
        response = await updateProgram(program?.id, values);
      } else {
        response = await createProgram(values);
      }

      if (!response.ok) {
        throw new Error(response.message);
      }

      toast({
        title: "Success",
        description: `Program ${program ? "updated" : "created"} successfully.`,
      });

      form.reset(values);
      router.push("/admin/program");
    } catch (error) {
      console.log("Error submitting program:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save program. Please try again.",
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
                    {Object.entries(statusConfig).map(([value, config], i) => (
                      <SelectItem
                        key={i + value}
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
            <CardTitle>Program Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={getFieldStyles("name")}>
                    Program Name
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
                      {hosts.map((host, i) => (
                        <SelectItem key={i + host?.id} value={host?.id}>
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
                      {properties.map((property, i) => (
                        <SelectItem key={i + property?.id} value={property?.id}>
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
                    Program Category
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
                      {ENTITY_CATEGORIES.map((category, i) => (
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
                    defaultValue={field.value}
                    disabled
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
                    Fixed is only option at present.
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
        {/* Program Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Program Highlights</CardTitle>
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
          disabled={isLoading || isEmpty(form.getValues())}
          className={cn({
            "bg-atma-yellow text-black": isLoading || form.formState.isDirty,
            "bg-atma-mint text-black": form.formState.isSubmitSuccessful,
          })}
        >
          {isLoading
            ? "Submitting..."
            : isEmpty(form.getValues())
              ? "Program Updated"
              : program
                ? "Update Program"
                : "Create Program"}
        </Button>
      </form>
    </Form>
  );
}
