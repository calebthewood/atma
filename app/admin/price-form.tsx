"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  createPriceMod,
  getPriceMod,
  updatePriceMod,
} from "@/actions/price-mod-actions";
import { PriceModInput, priceModSchema } from "@/schemas/price-mods";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

type EntityType =
  | "host"
  | "program"
  | "retreat"
  | "retreatInstance"
  | "property";

export function PriceModForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [noDateRange, setNoDateRange] = useState(true);
  const [noGuestRange, setNoGuestRange] = useState(true);

  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL segments
  const segments = pathname.split("/").filter(Boolean);
  const entityType = segments[1] as EntityType; // After 'admin'
  const entityId = params?.id as string;
  const instanceId = searchParams.get("edit");
  const priceModId = searchParams.get("price");

  // Helper function to get entity fields based on URL structure
  const getEntityFields = (): Partial<PriceModInput> => {
    const fields: Partial<PriceModInput> = {
      hostId: undefined,
      programId: undefined,
      retreatId: undefined,
      retreatInstanceId: undefined,
      propertyId: undefined,
    };

    // Map plural entity type from URL to singular field name
    switch (entityType) {
      case "host":
        fields.hostId = entityId;
        break;
      case "program":
        fields.programId = entityId;
        break;
      case "retreat":
        fields.retreatId = entityId;
        // If we have an instanceId, this is a retreat instance price mod
        if (instanceId) {
          fields.retreatInstanceId = instanceId;
        }
        break;
      case "property":
        fields.propertyId = entityId;
        break;
    }

    return fields;
  };

  const form = useForm<PriceModInput>({
    resolver: zodResolver(priceModSchema),
    defaultValues: {
      name: "Price",
      desc: "Additional description to show in a tooltip",
      type: "BASE_PRICE",
      currency: "USD",
      value: 0,
      unit: "FIXED",
      dateStart: undefined,
      dateEnd: undefined,
      guestMin: undefined,
      guestMax: undefined,
      roomType: "all",
      hostId: undefined,
      propertyId: undefined,
      programId: undefined,
      retreatId: undefined,
      retreatInstanceId: undefined,
      ...getEntityFields(),
    },
  });

  async function onSubmit(values: PriceModInput) {
    setIsLoading(true);
    try {
      const payload: PriceModInput = {
        ...values,
        dateStart: noDateRange ? undefined : values.dateStart,
        dateEnd: noDateRange ? undefined : values.dateEnd,
        guestMin: noGuestRange ? undefined : values.guestMin,
        guestMax: noGuestRange ? undefined : values.guestMax,
        ...getEntityFields(),
      };

      let result;
      if (priceModId) {
        result = await updatePriceMod(priceModId, payload);
      } else {
        result = await createPriceMod(payload);
      }

      if (!result.ok) {
        throw new Error(result.error || "Failed to save price modification");
      }

      toast({
        title: "Success",
        description: `Price modification ${priceModId ? "updated" : "created"} successfully.`,
      });

      // Clear the price param but maintain the edit param if it exists
      const params = new URLSearchParams(searchParams.toString());
      params.delete("price");
      router.push(`${pathname}?${params.toString()}`);
    } catch (error) {
      console.error("Error submitting price mod:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save price modification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function loadPriceMod() {
      if (!priceModId) return;

      try {
        setIsLoading(true);
        const response = await getPriceMod(priceModId);

        if (response.ok && response.data) {
          const priceMod = response.data;

          setNoDateRange(!priceMod.dateStart && !priceMod.dateEnd);
          setNoGuestRange(!priceMod.guestMin && !priceMod.guestMax);

          form.reset({
            ...priceMod,
            dateStart: priceMod.dateStart
              ? new Date(priceMod.dateStart)
              : undefined,
            dateEnd: priceMod.dateEnd ? new Date(priceMod.dateEnd) : undefined,
            guestMin: priceMod.guestMin ?? undefined,
            guestMax: priceMod.guestMax ?? undefined,
            ...getEntityFields(),
          });
        }
      } catch (error) {
        console.error("Error loading price mod:", error);
        toast({
          title: "Error",
          description: "Failed to load price modification",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadPriceMod();
  }, [priceModId, form]);
  const handleDateRangeToggle = (checked: boolean) => {
    setNoDateRange(checked);
    if (checked) {
      form.setValue("dateStart", undefined);
      form.setValue("dateEnd", undefined);
    }
  };

  const handleGuestRangeToggle = (checked: boolean) => {
    setNoGuestRange(checked);
    if (checked) {
      form.setValue("guestMin", undefined);
      form.setValue("guestMax", undefined);
    }
  };

  if (!entityType || !entityId) {
    return (
      <div className="text-center text-muted-foreground">
        Invalid URL structure
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {priceModId ? "Update Pricing" : "Create New Pricing"}
        </CardTitle>
        <CardDescription>
          {instanceId
            ? `Manage pricing for retreat instance ${instanceId}`
            : `Manage pricing for ${entityType.slice(0)} ${entityId}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Early Bird Discount" {...field} />
                  </FormControl>
                  <FormDescription>
                    Shown in during checkout (except base modifier)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormDescription>
                    Shown in tooltip when hovering over name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="BASE_PRICE" />
                        <FormLabel className="font-normal">
                          Base Price
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="DISCOUNT" />
                        <FormLabel className="font-normal">Discount</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="FEE" />
                        <FormLabel className="font-normal">Fee</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="TAX" />
                        <FormLabel className="font-normal">Tax</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="ADDON" />
                        <FormLabel className="font-normal">Add-on</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="BASE_MOD" />
                        <FormLabel className="font-normal">
                          Base Modifier
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    {` Use "base modifier" for seasonal pricing or other items you
                    wish to change the base price without showing as a separate
                    line item.`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <FormDescription>
                    Only USD offered at this time
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    The dollar value of this price item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="FIXED" />
                        <FormLabel className="font-normal">
                          Fixed Amount
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="PERCENT" />
                        <FormLabel className="font-normal">
                          Percentage
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Whether to calculate as a fixed value or a percentage of the
                    base price + any base modifiers & discounts.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="noDateRange"
                  checked={noDateRange}
                  onCheckedChange={handleDateRangeToggle}
                />
                <label
                  htmlFor="noDateRange"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  No set date range (apply to all dates)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateStart"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild disabled={noDateRange}>
                          <FormControl>
                            <Button variant="outline">
                              {field.value
                                ? format(field.value, "PPP")
                                : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value ?? undefined}
                            onSelect={field.onChange}
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
                  name="dateEnd"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger disabled={noDateRange} asChild>
                          <FormControl>
                            <Button variant="outline">
                              {field.value
                                ? format(field.value, "PPP")
                                : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value ?? undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="noGuestRange"
                  checked={noGuestRange}
                  onCheckedChange={handleGuestRangeToggle}
                />
                <label
                  htmlFor="noGuestRange"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  No guest range limits (apply to all group sizes)
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guestMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Guests</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? 1}
                          disabled={noGuestRange}
                          type="number"
                          min={1}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guestMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Guests</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? 1}
                          disabled={noGuestRange}
                          type="number"
                          min={1}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="submit"
                disabled={isLoading}
                className={cn({
                  "bg-yellow-500": isLoading || form.formState.isDirty,
                  "bg-green-500": form.formState.isSubmitSuccessful,
                })}
              >
                {isLoading
                  ? "Saving..."
                  : priceModId
                    ? "Update Price Modification"
                    : "Create Price Modification"}
              </Button>

              {priceModId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("price");
                    router.push(
                      `${window.location.pathname}?${params.toString()}`
                    );
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
