"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getRetreats } from "@/actions/retreat-actions";
import {
  createRetreatInstance,
  getRetreatInstance,
  updateRetreatInstance,
} from "@/actions/retreat-instance";
import {
  RetreatInstanceFormData,
  retreatInstanceFormSchema,
} from "@/schemas/retreat-instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Retreat, RetreatInstance } from "@prisma/client";
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

export function RetreatInstanceForm() {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentInstance, setCurrentInstance] =
    useState<RetreatInstance | null>(null);

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const retreatId = params.id as string;
  const editId = searchParams.get("edit");

  const form = useForm<RetreatInstanceFormData>({
    resolver: zodResolver(retreatInstanceFormSchema),
    defaultValues: {
      retreatId: retreatId,
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      duration: 0,
      itinerary: "Bulleted list of items, end each point with a semicolon;",
      availableSlots: 0,
      isFull: false,
    },
  });

  // Load instance data when edit param changes
  useEffect(() => {
    async function loadInstanceData() {
      if (!editId) {
        form.reset({
          retreatId: retreatId,
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
        const response = await getRetreatInstance(editId);
        if (response.success && response.data) {
          const instance = response.data;
          setCurrentInstance(instance);
          form.reset({
            retreatId: instance.retreatId,
            startDate: new Date(instance.startDate),
            endDate: new Date(instance.endDate),
            duration: instance.duration,
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
  }, [editId, form, retreatId]);

  useEffect(() => {
    async function fetchRetreats() {
      try {
        const fetchedRetreats = await getRetreats();
        setRetreats(fetchedRetreats);
      } catch (error) {
        console.error("Error fetching retreats:", error);
        toast({
          title: "Error",
          description: "Failed to load retreats",
          variant: "destructive",
        });
      }
    }

    fetchRetreats();
  }, []);

  const handleFieldBlur = async (fieldName: keyof RetreatInstanceFormData) => {
    if (currentInstance) {
      try {
        const fieldValue = form.getValues(fieldName);
        const response = await updateRetreatInstance(currentInstance.id, {
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

  async function onSubmit(values: RetreatInstanceFormData) {
    setIsLoading(true);
    try {
      if (currentInstance) {
        const response = await updateRetreatInstance(
          currentInstance.id,
          values
        );
        if (response.success) {
          toast({
            title: "Success",
            description: "Retreat instance updated successfully.",
          });
          router.push(`/admin/retreat/${retreatId}/instances`);
        } else {
          throw new Error(response.error);
        }
      } else {
        const response = await createRetreatInstance(values);
        if (response.success) {
          toast({
            title: "Success",
            description: "Retreat instance created successfully.",
          });
          form.reset();
          router.push(`/admin/retreat/${retreatId}/instances`);
        } else {
          throw new Error(response.error);
        }
      }
    } catch (error) {
      console.error("Error submitting retreat instance:", error);
      toast({
        title: "Error",
        description: "Failed to save retreat instance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getFieldStyles = (fieldName: keyof RetreatInstanceFormData) => {
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
            ? "Update Retreat Instance"
            : "Create Retreat Instance"}
        </CardTitle>
        <CardDescription>
          Add or edit retreat instances. Set prices in the pricing tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto max-w-lg space-y-8"
          >
            <FormField
              control={form.control}
              name="retreatId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={getFieldStyles("retreatId")}>
                    Retreat
                  </FormLabel>
                  <Select
                    disabled
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldBlur("retreatId");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={getFieldStyles("retreatId")}>
                        <SelectValue placeholder="Select a retreat" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {retreats.map((retreat) => (
                        <SelectItem key={retreat.id} value={retreat.id}>
                          {retreat.name || "Unnamed Retreat"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    Number of nights for this retreat instance
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  ? "Update Retreat Instance"
                  : "Create Retreat Instance"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
