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
import { Property, Host } from "@prisma/client";
import { useForm } from "react-hook-form";

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

type PropertyFormProps = {
  property?: Property;
};

export function PropertyForm({ property }: PropertyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
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
      address: property?.address || "",
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
    },
  });

  const handleFieldBlur = async (fieldName: keyof PropertyFormData) => {
    if (property) {
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
        form.setError(fieldName, { type: "manual", message: "Update failed" });
      }
    }
  };

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-lg space-y-8"
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
                  placeholder="Amazing Resort"
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
                  placeholder="contact@example.com"
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
                  placeholder="+1 (123) 456-7890"
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
          name="descShort"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("descShort")}>
                Short Description
              </FormLabel>
              <FormControl>
                <Textarea
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Ocean Drive" {...field} />
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
              <FormLabel>Closest Airport</FormLabel>
              <FormControl>
                <Input placeholder="JFK" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Miami, FL" {...field} />
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
              <FormLabel>Property Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
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
              <FormLabel>Host</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
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
