"use client";

import { useEffect, useState } from "react";
import { getHosts } from "@/actions/host-actions";
import {
  createProperty,
  getProperties,
  updateProperty,
} from "@/actions/property-actions";
import {
  PropertyFormData,
  propertyFormSchema,
} from "@/schemas/property-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Host, Property } from "@prisma/client";
import { RegisterOptions, useForm } from "react-hook-form";

import { cn, toKebabCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

import { AmenityCheckboxes } from "../amenity-field";

type PropertyFormProps = {
  property?: Property | null;
};

export function PropertyForm({ property }: PropertyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customDeskHours, setCustomDeskHours] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [uncategorizedTags, setUncategorizedTags] = useState<string[]>([]);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: property?.name || "",
      email: property?.email || "",
      phone: property?.phone || "",
      descShort: property?.descShort || "",
      descList: property?.descList || "",
      lat: property?.lat || undefined,
      lng: property?.lng || undefined,
      coordType: property?.coordType || "",
      city: property?.city || "",
      address: property?.address || property?.addressRaw || "",
      addressRaw: property?.addressRaw || "",
      nearbyAirport: property?.nearbyAirport || "",
      placeList: property?.placeList || "",
      policyList: property?.policyList || "",
      tagList: property?.tagList || "",
      location: property?.location || "",
      type: property?.type || "",
      amenityHealing: property?.amenityHealing || "",
      amenityCuisine: property?.amenityCuisine || "",
      amenityActivity: property?.amenityActivity || "",
      amenityFacility: property?.amenityFacility || "",
      rating: property?.rating || "",
      coverImg: property?.coverImg || "",
      hostId: property?.hostId || "",
      checkInTime: property?.checkInTime || "",
      checkOutTime: property?.checkOutTime || "",
      frontDeskHours: property?.frontDeskHours || "",
      childrenAllowed: property?.childrenAllowed ?? false,
      additionalFeeForChildren: property?.additionalFeeForChildren || 0,
      extraBeds: property?.extraBeds ?? false,
      extraBedFee: property?.extraBedFee || "",
      breakFastProvided: property?.breakFastProvided ?? false,
      breakfastType: property?.breakfastType || "",
      breakfastFeeAdult: property?.breakfastFeeAdult || 0,
      breakfastFeeChild: property?.breakfastFeeChild || 0,
      breakfastIncluded: property?.breakfastIncluded ?? false,
      depositRequired: property?.depositRequired ?? false,
      depositMethods: property?.depositMethods || "",
      paymentMethods: property?.paymentMethods || "",
      petsAllowed: property?.petsAllowed ?? false,
      serviceAnimalsAllowed: property?.serviceAnimalsAllowed ?? false,
      minAgeForPrimary: property?.minAgeForPrimary || 18,
    },
  });

  async function onSubmit(values: PropertyFormData) {
    setIsLoading(true);
    try {
      if (property) {
        await updateProperty(property.id, values);
        toast({
          title: "Success",
          description: "Property updated successfully.",
        });
      } else {
        await createProperty(values);
        toast({
          title: "Success",
          description: "Property created successfully.",
        });
      }
      form.reset(values);
    } catch (error) {
      console.error("Error submitting property:", error);
      toast({
        title: "Error",
        description: "Failed to save property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedHosts, fetchedProperties] = await Promise.all([
          getHosts(),
          getProperties(),
        ]);
        setHosts(fetchedHosts);
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

  const formValues = form.watch();
  const ON_CHANGE_FIELDS = new Set([
    "childrenAllowed",
    "petsAllowed",
    "serviceAnimalsAllowed",
    "breakFastProvided",
    "breakfastIncluded",
    "breakfastType",
    "depositRequired",
    "extraBeds",
    "checkInTime",
    "checkOutTime",
    "depositMethods",
    "paymentMethods",
    "tagList",
  ]);

  useEffect(() => {
    console.log("Effect Ran!");
    if (!property) return;

    const subscription = form.watch(async (value, { name, type }) => {
      console.log("type", type);
      if (
        name &&
        form.formState.dirtyFields[name] &&
        !form.formState.isSubmitting &&
        (type === "blur" || (type === "change" && ON_CHANGE_FIELDS.has(name)))
      ) {
        try {
          await handleFieldBlur(name as keyof PropertyFormData);
        } catch (error) {
          console.error(`Error updating ${name}:`, error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [property, formValues]);

  const handleFieldBlur = async (fieldName: keyof PropertyFormData) => {
    if (!property) return;

    try {
      const fieldValue = form.getValues(fieldName);
      console.log("Hit");
      await updateProperty(property.id, { [fieldName]: fieldValue });

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

  const getFieldStyles = (fieldName: keyof PropertyFormData) => {
    const isSubmitting = form.formState.isSubmitting;
    const isValid = !form.formState.errors[fieldName];
    const isDirty = form.formState.dirtyFields[fieldName];

    return cn("transition-colors duration-300", {
      "border-atma-yellow text-atma-yellow": isSubmitting,
      "border-atma-mint text-atma-mint": isValid && isDirty && !isSubmitting,
      "border-atma-red text-atma-red": !isValid && !isSubmitting,
    });
  };

  const breakfastTypes = [
    { id: "buffet", label: "Buffet" },
    { id: "gluten-free", label: "Gluten-free" },
    { id: "vegan", label: "Vegan" },
    { id: "vegetarian", label: "Vegetarian" },
  ];

  const depositMethods = [
    { id: "credit-card", label: "Credit Card" },
    { id: "debit-card", label: "Debit Card" },
    { id: "cash", label: "Cash" },
  ];

  const paymentMethods = [
    { id: "jcb", label: "JCB" },
    { id: "union-pay", label: "Union Pay" },
    { id: "visa", label: "Visa" },
    { id: "mastercard", label: "Mastercard" },
    { id: "american-express", label: "American Express" },
  ];

  if (!property) return null;
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
              <FormLabel className={getFieldStyles("name")}>
                Property Name
              </FormLabel>
              <FormControl>
                <Input
                  className={getFieldStyles("name")}
                  placeholder="Enter property/resort name"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("email")}>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className={getFieldStyles("email")}
                  type="email"
                  placeholder="point of contact email"
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
              <FormLabel className={getFieldStyles("phone")}>Phone</FormLabel>
              <FormControl>
                <Input
                  className={getFieldStyles("phone")}
                  placeholder="point of contact phone number"
                  {...field}
                  onBlur={() => handleFieldBlur("phone")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("address")}>
                Address
              </FormLabel>
              <FormControl>
                <Input
                  className={getFieldStyles("address")}
                  placeholder="Enter full address"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Defaults to the raw address scraped from website
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descShort"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("descShort")}>
                Property Overview ({field?.value?.length}/200)
              </FormLabel>
              <FormControl>
                <Textarea
                  maxLength={200}
                  className={getFieldStyles("descShort")}
                  placeholder="A brief description of the property..."
                  {...field}
                  onBlur={() => handleFieldBlur("descShort")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descList"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("descList")}>
                Description ({field?.value?.length}/500)
              </FormLabel>
              <FormControl>
                <Textarea
                  maxLength={1000}
                  className={getFieldStyles("descList")}
                  placeholder="A brief description of the property..."
                  {...field}
                  onBlur={() => handleFieldBlur("descList")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nearbyAirport"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("nearbyAirport")}>
                Nearest Airport
              </FormLabel>
              <FormControl>
                <Input
                  className={getFieldStyles("nearbyAirport")}
                  placeholder="Enter airport name"
                  {...field}
                  onBlur={() => handleFieldBlur("nearbyAirport")}
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
              <FormLabel className={getFieldStyles("type")}>
                Property Type
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={getFieldStyles("type")}>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="resort">Resort</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="more">Add more options?</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tagList"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags & Keywords</FormLabel>
              <FormControl>
                <CategoryCheckboxes
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Check-in/Check-out Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="frontDeskHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Front Desk Hours</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        if (value === "24/7") {
                          field.onChange("24/7");
                          setCustomDeskHours(false);
                        } else {
                          setCustomDeskHours(true);
                          // Only reset field value if it's currently 24/7
                          if (field.value === "24/7") {
                            field.onChange("");
                          }
                        }
                      }}
                      value={field.value === "24/7" ? "24/7" : "custom"}
                      className="mb-4"
                    >
                      <div className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2">
                          <RadioGroupItem value="24/7" />
                          <FormLabel className="font-normal">24/7</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" />
                          <FormLabel className="font-normal">
                            Custom Hours
                          </FormLabel>
                        </FormItem>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  {customDeskHours && (
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          type="time"
                          value={field.value?.split("-")[0] || ""}
                          onChange={(e) => {
                            const endTime = field.value?.split("-")[1] || "";
                            field.onChange(
                              `${e.target.value}${endTime ? "-" + endTime : ""}`
                            );
                          }}
                          placeholder="Start Time"
                        />
                      </div>
                      <div>
                        <Input
                          type="time"
                          value={field.value?.split("-")[1] || ""}
                          onChange={(e) => {
                            const startTime = field.value?.split("-")[0] || "";
                            field.onChange(
                              `${startTime}${e.target.value ? "-" + e.target.value : ""}`
                            );
                          }}
                          placeholder="End Time"
                        />
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="checkInTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Check-in Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="checkOutTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Check-out Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Amenity Tabs</h3>
          <FormField
            control={form.control}
            name="amenityHealing"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={getFieldStyles("amenityHealing")}>
                  Spa Offerings ({field?.value?.length}/100)
                </FormLabel>
                <FormControl>
                  <Textarea
                    maxLength={200}
                    className={getFieldStyles("amenityHealing")}
                    placeholder="Enter spa details here"
                    {...field}
                    onBlur={() => handleFieldBlur("amenityHealing")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amenityCuisine"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={getFieldStyles("amenityCuisine")}>
                  Cuisine Offerings ({field?.value?.length}/100)
                </FormLabel>
                <FormControl>
                  <Textarea
                    maxLength={200}
                    className={getFieldStyles("amenityCuisine")}
                    placeholder="Enter cuisine details"
                    {...field}
                    onBlur={() => handleFieldBlur("amenityCuisine")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="amenityActivity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={getFieldStyles("amenityActivity")}>
                  Activities ({field?.value?.length}/100)
                </FormLabel>
                <FormControl>
                  <Textarea
                    maxLength={200}
                    className={getFieldStyles("amenityActivity")}
                    placeholder="A brief description of the property..."
                    {...field}
                    onBlur={() => handleFieldBlur("amenityActivity")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="amenityFacility"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-semibold">
                  Facilities
                </FormLabel>
                <FormControl>
                  <AmenityCheckboxes
                    entityId={property.id}
                    entityType="property"
                    amenityType="facility"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amenityActivity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activities</FormLabel>
                <FormControl>
                  <AmenityCheckboxes
                    entityId={property.id}
                    entityType="property"
                    amenityType="activity"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amenityFacility"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={getFieldStyles("amenityFacility")}>
                  Raw Facilities ({field?.value?.length}/100)
                </FormLabel>
                <FormControl>
                  <Textarea
                    maxLength={200}
                    className={getFieldStyles("amenityFacility")}
                    placeholder="A brief description of the property..."
                    {...field}
                    onBlur={() => handleFieldBlur("amenityFacility")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Children & Extra Beds</h3>
          <FormField
            control={form.control}
            name="childrenAllowed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Children Allowed?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "true")}
                    defaultValue={field.value ? "true" : "false"}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <RadioGroupItem value="true" />
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <RadioGroupItem value="false" />
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("childrenAllowed") && (
            <FormField
              control={form.control}
              name="additionalFeeForChildren"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Fee for Children</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Breakfast Options</h3>
          <FormField
            control={form.control}
            name="breakfastType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breakfast Types Available</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  {breakfastTypes.map((type) => (
                    <FormField
                      key={type.id}
                      control={form.control}
                      name="breakfastType"
                      render={({ field }) => (
                        <FormItem
                          key={type.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(type.id)}
                              onCheckedChange={(checked) => {
                                const current = field.value?.split(",") || [];
                                const updated = checked
                                  ? [...current, type.id]
                                  : current.filter(
                                      (value) => value !== type.id
                                    );
                                field.onChange(updated.join(","));
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {type.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="breakfastFeeAdult"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breakfast Fee (Adult)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="breakfastFeeChild"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breakfast Fee (Child)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment & Deposit</h3>
          <FormField
            control={form.control}
            name="paymentMethods"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accepted Payment Methods</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <FormField
                      key={method.id}
                      control={form.control}
                      name="paymentMethods"
                      render={({ field }) => (
                        <FormItem
                          key={method.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(method.id)}
                              onCheckedChange={(checked) => {
                                const current = field.value?.split(",") || [];
                                const updated = checked
                                  ? [...current, method.id]
                                  : current.filter(
                                      (value) => value !== method.id
                                    );
                                field.onChange(updated.join(","));
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {method.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="depositMethods"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accepted Deposit Methods</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  {depositMethods.map((method) => (
                    <FormField
                      key={method.id}
                      control={form.control}
                      name="depositMethods"
                      render={({ field }) => (
                        <FormItem
                          key={method.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(method.id)}
                              onCheckedChange={(checked) => {
                                const current = field.value?.split(",") || [];
                                const updated = checked
                                  ? [...current, method.id]
                                  : current.filter(
                                      (value) => value !== method.id
                                    );
                                field.onChange(updated.join(","));
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {method.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pet Policy</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="petsAllowed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pets Allowed?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      defaultValue={field.value ? "true" : "false"}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <RadioGroupItem value="true" />
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <RadioGroupItem value="false" />
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceAnimalsAllowed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Animals Allowed?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      defaultValue={field.value ? "true" : "false"}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <RadioGroupItem value="true" />
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <RadioGroupItem value="false" />
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="hostId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("hostId")}>Host</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            : property
              ? "Update Property"
              : "Create Property"}
        </Button>
      </form>
    </Form>
  );
}

type CategoryCheckboxesProps = {
  value: string;
  onChange: (value: string) => void;
};

const CategoryCheckboxes = ({ value, onChange }: CategoryCheckboxesProps) => {
  const [uncategorizedTags, setUncategorizedTags] = useState<string[]>([]);

  const CATEGORY_TAGS = [
    { id: "adventure", label: "Adventure" },
    { id: "anti-ageing", label: "Anti-Ageing" },
    { id: "ayurveda", label: "Ayurveda" },
    { id: "couples", label: "Couples" },
    { id: "detox", label: "Detox" },
    { id: "emotional-healing", label: "Emotional Healing" },
    { id: "fitness", label: "Fitness" },
    { id: "fitness-retreats", label: "Fitness Retreats" },
    { id: "health-retreat", label: "Health Retreat" },
    { id: "holistic-healing", label: "Holistic Healing" },
    { id: "longevity", label: "Longevity" },
    { id: "medical", label: "Medical" },
    { id: "medical-spa", label: "Medical Spa" },
    { id: "meditation-retreats", label: "Meditation Retreats" },
    { id: "mens-retreat", label: "Men's Retreat" },
    { id: "pampering", label: "Pampering" },
    { id: "sleep-retreats", label: "Sleep Retreats" },
    { id: "spa-retreat", label: "Spa Retreat" },
    { id: "spiritual", label: "Spiritual" },
    { id: "weight-loss-retreat", label: "Weight Loss Retreat" },
    { id: "womens-retreat", label: "Women's Retreat" },
    { id: "yoga", label: "Yoga" },
    { id: "yoga-retreat", label: "Yoga Retreat" },
    { id: "entrepreneur-retreat", label: "Entrepreneur Retreat" },
    { id: "mental-health", label: "Mental Health" },
  ];

  const existingTags =
    value
      ?.split("|")
      .map((tag) => tag.trim())
      .map(toKebabCase) || [];

  useEffect(() => {
    const uncategorized = existingTags.filter(
      (tag) => !CATEGORY_TAGS.some((cat) => cat.id === tag)
    );
    setUncategorizedTags(uncategorized);
  }, [value]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 rounded bg-white/20 p-4 backdrop-blur md:grid-cols-3 lg:grid-cols-4">
        {CATEGORY_TAGS.map((category) => (
          <div key={category.id} className="">
            <label className="flex flex-row items-center space-x-3 space-y-0 text-sm font-normal">
              <Checkbox
                checked={existingTags.includes(category.id)}
                onCheckedChange={(checked) => {
                  const currentTags = new Set(existingTags);
                  if (checked) {
                    currentTags.add(category.id);
                  } else {
                    currentTags.delete(category.id);
                  }
                  // Convert back to pipe-separated string with proper formatting
                  const newValue = Array.from(currentTags)
                    .map(
                      (tag) =>
                        CATEGORY_TAGS.find((cat) => cat.id === tag)?.label ||
                        tag
                    )
                    .join(" | ");
                  onChange(newValue);
                }}
              />
              <span>{category.label}</span>
            </label>
          </div>
        ))}
      </div>
      {uncategorizedTags.length > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          Unmatched tags: {uncategorizedTags.join(", ")}
        </p>
      )}
    </>
  );
};
