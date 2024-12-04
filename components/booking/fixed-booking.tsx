"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type ProgramWithBasicRelations } from "@/actions/program-actions";
import { type RetreatWithRelations } from "@/actions/retreat-actions";
import {
  PriceMod,
  type ProgramInstance,
  type RetreatInstance,
} from "@prisma/client";
import { addDays, format, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";

import { calculateFinalPrice, toUSD } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import CheckoutButton from "../checkout/checkout-button";
import { ClickyCounter } from "../counter";
import { Lead, P, Small } from "../typography";
import { DatePickerFixedRange } from "../ui/date-pickers";

const today = new Date();
interface BookingProps {
  type: "program" | "retreat";
  item: ProgramWithBasicRelations | RetreatWithRelations;
  instances: RetreatInstance[] | ProgramInstance[];
  userId: string | undefined;
  priceMods: PriceMod[];
}

export function FixedBooking({
  userId,
  type,
  item,
  instances,
  priceMods: rawPriceMods,
}: BookingProps) {
  // Doing this, and :rawPriceMods above, to please typescript seems silly
  const priceMods = rawPriceMods.map((mod) => ({
    ...mod,
    source: "retreat" as const,
  }));
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the instance ID from search params
  const instanceId = searchParams.get("instance");
  const currentInstance = instances.find((i) => i.id === instanceId);

  // Initialize maxGuests (fallback to 16 if not specified)
  const maxGuests =
    item?.maxGuests && item?.maxGuests > 0 ? item.maxGuests : 16;

  // Get base price from price mods
  const basePrice = priceMods.find((mod) => mod.type === "BASE_PRICE");

  // Initialize date state from URL or defaults
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    if (fromParam && toParam) {
      return {
        from: parseISO(fromParam),
        to: parseISO(toParam),
      };
    }

    return {
      from: today,
      to: addDays(today, currentInstance?.duration || 1),
    };
  });

  // Update URL when date changes
  useEffect(() => {
    if (date?.from && date?.to) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", format(date.from, "yyyy-MM-dd"));
      params.set("to", format(date.to, "yyyy-MM-dd"));
      params.set("maxGuests", maxGuests.toString());
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [date, maxGuests, router, searchParams]);

  const getPriceModsByType = (type: string) => {
    return priceMods.filter((mod) => mod.type === type);
  };

  const calculateSubtotal = () => {
    const guestCount = parseInt(searchParams.get("guests") || "1");
    return basePrice ? basePrice.value * guestCount : 0;
  };

  const total = calculateFinalPrice(priceMods);
  const renderPriceModGroup = (type: string, label: string) => {
    const mods = getPriceModsByType(type);
    if (!mods.length) return null;

    return (
      <div className="space-y-1">
        <Small className="text-primary/60">{label}</Small>
        {mods.map((mod, i) => (
          <Tooltip key={`${type}-${i}`}>
            <TooltipTrigger className="w-full">
              <Small className="flex w-full cursor-help justify-between text-primary/60">
                <span>{mod.name}</span>
                <span>{toUSD(mod.value)}</span>
              </Small>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] text-sm">
              <div>
                <p>{mod.desc || "No description available"}</p>
                <p className="mt-1 text-xs text-primary/60">
                  Source: {mod?.source || "NA"}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  };

  // if (isLoading) {
  //   return <Card className="max-w-md animate-pulse" />;
  // }

  return (
    <Card className="min-w-fit max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">
          {basePrice ? toUSD(basePrice.value) : "Price on request"}
          <Lead className="inline text-sm"> / </Lead>
          <Small>{currentInstance?.duration} nights</Small>
        </CardTitle>
        <CardDescription>
          Fixed {type === "program" ? "Program" : "Retreat"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <DatePickerFixedRange
            className="w-full"
            selectedRange={date}
            setSelectedRange={setDate}
            duration={currentInstance?.duration || 1}
          />
        </div>
        <div className="mt-2 flex w-full">
          <ClickyCounter />
        </div>
      </CardContent>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-4">
            {renderPriceModGroup("BASE_MOD", "Seasonal Adjustments")}
            {renderPriceModGroup("ADDON", "Add-ons")}
            {renderPriceModGroup("FEE", "Fees")}
            {renderPriceModGroup("TAX", "Taxes")}
          </div>

          <div className="mt-4 border-t pt-4">
            <Small className="flex justify-between text-lg text-primary/60">
              <span>Subtotal</span>
              <span>{toUSD(calculateSubtotal())}</span>
            </Small>

            <P className="mt-2 flex justify-between font-semibold">
              <span className="text-primary/60">Total</span>
              <span>{toUSD(total)}</span>
            </P>
          </div>
        </TooltipProvider>
      </CardContent>
      <CardFooter className="justify-end">
        <CheckoutButton
          uiMode="embedded"
          price={total}
          userId={userId}
          propertyId={item.propertyId}
          checkInDate={date?.from}
          checkOutDate={date?.to}
          guestCount={parseInt(searchParams.get("guests") || "1")}
        />
      </CardFooter>
    </Card>
  );
}
