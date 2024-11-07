"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useForm } from "react-hook-form";

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
import CountrySelect from "@/components/country-select";
import { Lead } from "@/components/typography";

import { StatusField } from "../status-form-field";

type PropertyFormProps = {
  property?: Property | null;
};

export function PropertyForm({ property }: PropertyFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [hosts, setHosts] = useState<Host[]>([]);

  const router = useRouter();
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: property?.name || "",
      status: property?.status || "draft",
      email: property?.email || "",
      phone: property?.phone || "",
      descShort: property?.descShort || "",
      descList: property?.descList || "",
      lat: property?.lat || undefined,
      lng: property?.lng || undefined,
      coordType: property?.coordType || "",
      city: property?.city || "",
      country: property?.country || "",
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
      hostId: property?.hostId || hosts?.[0]?.id,
      checkInTime: property?.checkInTime || undefined,
      checkOutTime: property?.checkOutTime || undefined,
      frontDeskHours: property?.frontDeskHours || "24/7",
      childrenAllowed: property?.childrenAllowed ?? false,
      additionalFeeForChildren: property?.additionalFeeForChildren || 0,
      extraBeds: property?.extraBeds ?? false,
      extraBedFee: property?.extraBedFee || 0,
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
      let res;
      if (property) {
        res = await updateProperty(property.id, values);
        toast({
          title: "Success",
          description: "Property updated successfully.",
        });
      } else {
        res = await createProperty(values);
        toast({
          title: "Success",
          description: "Property created successfully.",
        });
        router.replace("/admin/properties/" + res.id);
      }
      console.log("res", res);
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
    "type",
    "status",
  ]);

  useEffect(() => {
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
      "border-atma-yellow": isSubmitting,
      "border-atma-mint": isValid && isDirty && !isSubmitting,
      "border-atma-red": !isValid && !isSubmitting,
    });
  };

  const paymentMethods = [
    { id: "american_express", label: "American Express" },
    { id: "cash", label: "Cash" },
    { id: "debit_card", label: "Debit Card" },
    { id: "jcb", label: "JCB" },
    { id: "mastercard", label: "Mastercard" },
    { id: "union_pay", label: "Union Pay" },
    { id: "visa", label: "Visa" },
  ];
  console.log(form.formState.errors);
  // if (!property) return null;
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-8"
      >
        <h3 className="text-lg font-semibold">General</h3>
        <StatusField form={form} />
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
                  placeholder=""
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
                  <SelectItem value="boutique-hotel">Boutique Hotel</SelectItem>
                  <SelectItem value="chalet">Chalet</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="eco-lodge">Eco-Lodge</SelectItem>
                  <SelectItem value="farm-stay">Farm Stay</SelectItem>
                  <SelectItem value="heritage-property">
                    Heritage Property
                  </SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="resort">Resort</SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Customer service email"
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
                  placeholder="Customer service phone number"
                  {...field}
                  onBlur={() => handleFieldBlur("phone")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location</h3>
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
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <CountrySelect
                      value={field.value}
                      onValueChange={field.onChange}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="coordType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coordinate Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coordinate type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="exact">Exact</SelectItem>
                      <SelectItem value="approximate">Approximate</SelectItem>
                    </SelectContent>
                  </Select>
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
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Details</h3>
        </div>
        <FormField
          control={form.control}
          name="descShort"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("descShort")}>
                Healing Focus({field?.value?.length}/200)
              </FormLabel>
              <FormControl>
                <Textarea
                  maxLength={200}
                  className={getFieldStyles("descShort")}
                  placeholder="3-5 bullet points highlighting the unique wellness offerings of the retreat."
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
                  placeholder="Describe the property’s ambiance, services, and unique qualities.
"
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
          name="tagList"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags & Keywords (Multi-select)</FormLabel>
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
          <h3 className="text-lg font-semibold">Offerings</h3>
          <Lead className="text-sm">
            These Amenities are descriptions for tabs, see Amenity tab above for
            checkbox/bullet list items
          </Lead>
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
          <FormField
            control={form.control}
            name="amenityFacility"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={getFieldStyles("amenityFacility")}>
                  Facility Offerings ({field?.value?.length}/100)
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
          <FormField
            control={form.control}
            name="amenityActivity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={getFieldStyles("amenityActivity")}>
                  Activity Offerings ({field?.value?.length}/100)
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
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Practical Information</h3>
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
                      icon="dollar"
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="extraBeds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Extra Beds/Cribs Available?</FormLabel>
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

          <FormField
            control={form.control}
            name="extraBedFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Extra Bed Fee</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    icon="dollar"
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

        <div className="space-y-4"></div>
        <div className="space-y-4">
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
          name="paymentMethods"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Accepted Payment Methods (Multi-select)</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <Checkbox
                      checked={field.value
                        ?.split(",")
                        .filter(Boolean)
                        .includes(method.id)}
                      onCheckedChange={(checked) => {
                        const current =
                          field.value?.split(",").filter(Boolean) || [];
                        const updated = checked
                          ? [...current, method.id]
                          : current.filter((value) => value !== method.id);

                        const newValue =
                          updated.length > 0 ? updated.join(",") : "";
                        field.onChange(newValue);
                      }}
                    />
                    <FormLabel className="font-normal">
                      {method.label}
                    </FormLabel>
                  </div>
                ))}
              </div>
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
    { id: "corporate", label: "Corporate" },
    { id: "couples", label: "Couples" },
    { id: "creative-art", label: "Creative & Art" },
    { id: "detox", label: "Detox" },
    { id: "eco-friendly", label: "Eco-Friendly" },
    { id: "emotional-wellness", label: "Emotional Wellness" },
    { id: "entrepreneur", label: "Entrepreneur" },
    { id: "family-group", label: "Family & Group" },
    { id: "fitness", label: "Fitness" },
    { id: "holistic", label: "Holistic" },
    { id: "hydrotherapy", label: "Hydrotherapy" },
    { id: "leadership", label: "Leadership" },
    { id: "medical", label: "Medical" },
    { id: "meditation", label: "Meditation" },
    { id: "mind-body", label: "Mind-Body" },
    { id: "mindfulness", label: "Mindfulness" },
    { id: "motherhood", label: "Motherhood" },
    { id: "nature", label: "Nature" },
    { id: "nutrition", label: "Nutrition" },
    { id: "optimal-weight", label: "Optimal Weight" },
    { id: "outdoor", label: "Outdoor" },
    { id: "personal-growth", label: "Personal Growth" },
    { id: "plant-medicine", label: "Plant Medicine" },
    { id: "relaxation", label: "Relaxation" },
    { id: "romantic", label: "Romantic" },
    { id: "shamanic", label: "Shamanic" },
    { id: "sleep-restorative", label: "Sleep & Restorative" },
    { id: "slow-aging", label: "Slow Aging" },
    { id: "sound-healing", label: "Sound Healing" },
    { id: "spa", label: "Spa" },
    { id: "therapeutic-fasting", label: "Therapeutic Fasting" },
    { id: "traditional-healing", label: "Traditional Healing" },
    { id: "womens", label: "Women’s" },
    { id: "yoga", label: "Yoga" },
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
