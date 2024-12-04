"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getPrograms } from "@/actions/program-actions";
import {
  createInstance,
  getInstance,
  updateInstance,
} from "@/actions/program-instance-actions";
import {
  InstanceFormData,
  instanceFormSchema,
} from "@/schemas/program-instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Program, ProgramInstance } from "@prisma/client";
import { addDays, addYears, startOfDay } from "date-fns";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

export function ProgramInstanceForm() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentInstance, setCurrentInstance] =
    useState<ProgramInstance | null>(null);

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = params.id as string;
  const editId = searchParams.get("edit");

  const form = useForm<InstanceFormData>({
    resolver: zodResolver(instanceFormSchema),
    defaultValues: {
      programId: programId,
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      duration: 0,
      itinerary: "Bulleted list of items, end each point with a semicolon;",
      availableSlots: 0,
      isFull: false,
    },
  });

  useEffect(() => {
    console.log("INSTANCE FORM ", programId);
    async function loadInstanceData() {
      if (!editId) {
        form.reset({
          programId: programId,
          startDate: new Date(),
          endDate: addDays(new Date(), 7),
          duration: 0,
          itinerary: "Bulleted list of items, end each point with a semicolon;",
          availableSlots: 0,
          isFull: false,
        });
        setCurrentInstance(null);
        return;
      }

      try {
        console.log("INSTANCE FORM ", editId);
        const response = await getInstance(editId);
        console.log("INSTANCE FORM ", response);
        if (response.success && response.data) {
          const instance = response.data;
          setCurrentInstance(instance);
          form.reset({
            programId: instance.programId,
            startDate: new Date(instance.startDate),
            endDate: new Date(instance.endDate),
            duration: instance?.duration,
            itinerary: instance.itinerary,
            availableSlots: instance.availableSlots,
            isFull: instance.isFull,
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to load retreat instance",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading instance:", error);
        toast({
          title: "Error",
          description: "Failed to load retreat instance",
          variant: "destructive",
        });
      }
    }

    loadInstanceData();
  }, [editId, form, programId]);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await getPrograms();
        if (response.success && response.data) {
          setPrograms(response.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load programs",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
        toast({
          title: "Error",
          description: "Failed to load programs",
          variant: "destructive",
        });
      }
    }

    fetchPrograms();
  }, []);

  const handleFieldBlur = async (fieldName: keyof InstanceFormData) => {
    if (currentInstance) {
      try {
        const fieldValue = form.getValues(fieldName);
        const response = await updateInstance(currentInstance.id, {
          [fieldName]: fieldValue,
        });

        if (response.success) {
          toast({
            title: "Updated",
            description: `${fieldName} has been updated.`,
          });
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error(`Error updating ${fieldName}:`, error);
        toast({
          title: "Error",
          description: `Failed to update ${fieldName}`,
          variant: "destructive",
        });
        form.setError(fieldName, { type: "manual", message: "Update failed" });
      }
    }
  };

  async function onSubmit(values: InstanceFormData) {
    setIsLoading(true);
    try {
      if (currentInstance) {
        const response = await updateInstance(currentInstance.id, values);
        if (response.success) {
          toast({
            title: "Success",
            description: "Program instance updated successfully.",
          });
          router.push(`/admin/program/${programId}/instances`);
        } else {
          throw new Error(response.error);
        }
      } else {
        const response = await createInstance(values);
        if (response.success) {
          toast({
            title: "Success",
            description: "Program instance created successfully.",
          });
          form.reset();
          router.push(`/admin/program/${programId}/instances`);
        } else {
          throw new Error(response.error);
        }
      }
    } catch (error) {
      console.error("Error submitting program instance:", error);
      toast({
        title: "Error",
        description: "Failed to save program instance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getFieldStyles = (fieldName: keyof InstanceFormData) => {
    const isSubmitting = form.formState.isSubmitting;
    const isValid = !form.formState.errors[fieldName];
    const isDirty = form.formState.dirtyFields[fieldName];

    return cn("transition-colors duration-300", {
      "border-yellow-500": isSubmitting,
      "border-green-500": isValid && isDirty && !isSubmitting,
      "border-red-500": !isValid && !isSubmitting,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {currentInstance
            ? "Update Program Instance"
            : "Create Program Instance"}
        </CardTitle>
        <CardDescription>
          Add or edit program instances. Set prices in the pricing tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto max-w-lg space-y-8"
          >
            {/* Program Select field */}
            <FormField
              control={form.control}
              name="programId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={getFieldStyles("programId")}>
                    Program
                  </FormLabel>
                  <Select
                    disabled
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldBlur("programId");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={getFieldStyles("programId")}>
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name || "Unnamed Program"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={getFieldStyles("startDate")}>
                      Start Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                              getFieldStyles("startDate")
                            )}
                          >
                            {field.value ? (
                              new Date(field.value).toLocaleDateString()
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(field.value)}
                          onSelect={(date) => {
                            field.onChange(startOfDay(date || new Date()));
                            handleFieldBlur("startDate");
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The first available date for this item
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={getFieldStyles("endDate")}>
                      End Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                              getFieldStyles("endDate")
                            )}
                          >
                            {field.value ? (
                              new Date(field.value).toLocaleDateString()
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(field.value)}
                          onSelect={(date) => {
                            field.onChange(
                              startOfDay(date || addYears(new Date(), 2))
                            );
                            handleFieldBlur("endDate");
                          }}
                          initialFocus
                          disabled={(date) =>
                            date < new Date(form.getValues("startDate"))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The last available date for this item
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration field */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={getFieldStyles("duration")}>
                    Duration (nights)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      className={getFieldStyles("duration")}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      onBlur={() => handleFieldBlur("duration")}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of nights for this program instance
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Itinerary field */}
            <FormField
              control={form.control}
              name="itinerary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={getFieldStyles("itinerary")}>
                    Itinerary
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className={getFieldStyles("itinerary")}
                      {...field}
                      onBlur={() => handleFieldBlur("itinerary")}
                      placeholder="Enter itinerary points, end each with a semicolon;"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter each itinerary item followed by a semicolon <b>;</b>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Available slots and Status fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="availableSlots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={getFieldStyles("availableSlots")}>
                      Available Slots
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        className={getFieldStyles("availableSlots")}
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(value);
                          form.setValue("isFull", value === 0);
                        }}
                        onBlur={() => handleFieldBlur("availableSlots")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFull"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={getFieldStyles("isFull")}>
                      Status
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value === "true");
                        handleFieldBlur("isFull");
                      }}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className={getFieldStyles("isFull")}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="false">Available</SelectItem>
                        <SelectItem value="true">Full</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn({
                "bg-atma-yellow text-black":
                  isLoading || form.formState.isDirty,
                "bg-atma-mint text-black": form.formState.isSubmitSuccessful,
              })}
            >
              {isLoading
                ? "Submitting..."
                : currentInstance
                  ? "Update Program Instance"
                  : "Create Program Instance"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
