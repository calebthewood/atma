"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRetreats } from "@/actions/retreat-actions";
import {
  createRetreatInstance,
  updateRetreatInstance,
} from "@/actions/retreat-instance";
import {
  RetreatInstanceFormData,
  retreatInstanceFormSchema,
} from "@/schemas/retreat-instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Retreat, RetreatInstance } from "@prisma/client";
import { addDays, startOfDay } from "date-fns";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { toast } from "@/components/ui/use-toast";

type RetreatInstanceFormProps = {
  retreatInstance?: RetreatInstance;
};

export function RetreatInstanceForm({
  retreatInstance,
}: RetreatInstanceFormProps) {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const retreatId = params.id as string;

  const form = useForm<RetreatInstanceFormData>({
    resolver: zodResolver(retreatInstanceFormSchema),
    defaultValues: {
      retreatId: retreatId, // Set from URL params
      startDate: retreatInstance?.startDate || new Date(),
      endDate: retreatInstance?.endDate || addDays(new Date(), 7),
      minNights: retreatInstance?.minNights || 1,
      maxNights: retreatInstance?.maxNights || -1,
      availableSlots: retreatInstance?.availableSlots || 0,
      isFull: retreatInstance?.isFull || false,
    },
  });

  useEffect(() => {
    async function fetchRetreats() {
      try {
        const fetchedRetreats = await getRetreats();
        setRetreats(fetchedRetreats);
      } catch (error) {
        console.error("Error fetching retreats:", error);
        toast({
          title: "Error",
          description: "Failed to load retreats. Please try again.",
          variant: "destructive",
        });
      }
    }

    fetchRetreats();
  }, []);

  const handleFieldBlur = async (fieldName: keyof RetreatInstanceFormData) => {
    if (retreatInstance) {
      try {
        const fieldValue = form.getValues(fieldName);
        await updateRetreatInstance(retreatInstance.id, {
          [fieldName]: fieldValue,
        });
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

  async function onSubmit(values: RetreatInstanceFormData) {
    setIsLoading(true);
    try {
      if (retreatInstance) {
        await updateRetreatInstance(retreatInstance.id, values);
        toast({
          title: "Success",
          description: "Retreat instance updated successfully.",
        });
      } else {
        await createRetreatInstance(values);
        toast({
          title: "Success",
          description: "Retreat instance created successfully.",
        });
        form.reset(values);
      }
    } catch (error) {
      console.error("Error submitting retreat instance:", error);
      toast({
        title: "Error",
        description: "Failed to save retreat instance. Please try again.",
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
      "border-atma-yellow text-atma-yellow": isSubmitting,
      "border-atma-mint text-atma-mint": isValid && isDirty && !isSubmitting,
      "border-atma-red text-atma-red": !isValid && !isSubmitting,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-lg space-y-8 mx-auto"
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
                          startOfDay(date || addDays(new Date(), 7))
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="minNights"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={getFieldStyles("minNights")}>
                  Minimum Nights
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    className={getFieldStyles("minNights")}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    onBlur={() => handleFieldBlur("minNights")}
                  />
                </FormControl>
                <FormDescription>
                  Minimum number of nights required
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxNights"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={getFieldStyles("maxNights")}>
                  Maximum Nights
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="-1"
                    className={getFieldStyles("maxNights")}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    onBlur={() => handleFieldBlur("maxNights")}
                  />
                </FormControl>
                <FormDescription>-1 for unlimited nights</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                      // Automatically update isFull based on availableSlots
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
            "bg-atma-yellow text-black": isLoading || form.formState.isDirty,
            "bg-atma-mint text-black": form.formState.isSubmitSuccessful,
          })}
        >
          {isLoading
            ? "Submitting..."
            : retreatInstance
              ? "Update Retreat Instance"
              : "Create Retreat Instance"}
        </Button>
      </form>
    </Form>
  );
}
