"use client";

import { useEffect, useState } from "react";
import { getHosts } from "@/actions/host-actions";
import { createProgram, updateProgram } from "@/actions/program-actions";
import { getProperties } from "@/actions/property-actions";
import { ProgramFormData, programFormSchema } from "@/schemas/program-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Host, Program, Property } from "@prisma/client";
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

type ProgramFormProps = {
  program?: Program;
};

export function ProgramForm({ program }: ProgramFormProps) {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      name: program?.name || "",
      duration: program?.duration || "",
      desc: program?.desc || "",
      priceList: program?.priceList || "",
      sourceUrl: program?.sourceUrl || "",
      propertyId: program?.propertyId || "",
      hostId: program?.hostId || "",
    },
  });

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

  const handleFieldBlur = async (fieldName: keyof ProgramFormData) => {
    if (program) {
      try {
        const fieldValue = form.getValues(fieldName);
        await updateProgram(program.id, { [fieldName]: fieldValue });
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

  async function onSubmit(values: ProgramFormData) {
    try {
      if (program) {
        await updateProgram(program.id, values);
        toast({
          title: "Success",
          description: "Program updated successfully.",
        });
      } else {
        await createProgram(values);
        toast({
          title: "Success",
          description: "Program created successfully.",
        });
      }
      form.reset(values);
    } catch (error) {
      console.error("Error submitting program:", error);
      toast({
        title: "Error",
        description: "Failed to save program. Please try again.",
        variant: "destructive",
      });
    }
  }

  const getFieldStyles = (fieldName: keyof ProgramFormData) => {
    const isSubmitting = form.formState.isSubmitting;
    const isValid = !form.formState.errors[fieldName];
    const isDirty = form.formState.dirtyFields[fieldName];

    return cn("transition-colors duration-300", {
      "border-atma-yellow text-atma-yellow": isSubmitting,
      "border-atma-amint text-atma-mint": isValid && isDirty && !isSubmitting,
      "border-atma-red text-atma-red": !isValid && !isSubmitting,
    });
  };

  return (
    <Form {...form}>
      <form
        className="max-w-lg space-y-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
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
                  placeholder="Yoga Retreat"
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
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("duration")}>
                Duration
              </FormLabel>
              <FormControl>
                <Input
                  className={getFieldStyles("duration")}
                  placeholder="7 days"
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
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("desc")}>
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the program..."
                  className={getFieldStyles("desc")}
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
                  className={getFieldStyles("sourceUrl")}
                  type="url"
                  placeholder="https://example.com"
                  {...field}
                  onBlur={() => handleFieldBlur("sourceUrl")}
                />
              </FormControl>
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
                defaultValue={field.value}
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
          name="hostId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={getFieldStyles("hostId")}>Host</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleFieldBlur("hostId");
                }}
                defaultValue={field.value}
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
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className={cn({
            "bg-atma-yellow text-black":
              form.formState.isSubmitting ||
              form.formState.isDirty ||
              form.formState.isLoading,
            "bg-atma-amint text-black": form.formState.isSubmitSuccessful,
          })}
        >
          {form.formState.isSubmitting
            ? "Submitting..."
            : program
              ? "Update Program"
              : "Create Program"}
        </Button>
      </form>
    </Form>
  );
}
