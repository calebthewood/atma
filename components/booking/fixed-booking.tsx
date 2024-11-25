"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RetreatWithPrice } from "@/actions/retreat-actions";
import { PriceMod, RetreatInstance } from "@prisma/client";
import { addDays, format, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";

import { toUSD } from "@/lib/utils";
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

interface RetreatInstanceWithMods extends RetreatInstance {
  priceMods: PriceMod[];
}

interface BookingListProps {
  event: RetreatInstanceWithMods;
  retreat: RetreatWithPrice;
  userId: string | undefined;
}

export function FixedBooking({ userId, retreat, event }: BookingListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize maxGuests
  const maxGuests =
    retreat.maxGuests && retreat.maxGuests > 0 ? retreat.maxGuests : 16;

  // Get prices and base price
  const prices = retreat.priceMods;
  const basePrice =
    prices.find((p) => p.name?.toLowerCase().includes("base")) ?? prices[0];

  // Initialize state from URL or defaults
  const [priceMods] = useState<PriceMod[]>(event?.priceMods || []);
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
      to: addDays(today, event?.duration),
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

  type ModifierType =
    | "BASE_PRICE"
    | "DISCOUNT"
    | "FEE"
    | "TAX"
    | "ADDON"
    | "BASE_MOD";

  type ModifierUnit = "FIXED" | "PERCENT";

  const calculateTotal = () => {
    const guestCount = parseInt(searchParams.get("guests") || "1");

    // Get base price from price mods
    const basePriceMod = priceMods.find((mod) => mod.type === "BASE_PRICE");
    const basePrice = basePriceMod?.value ?? 250; // fallback to 250 if no base price mod

    // Calculate initial base total (per guest per night)
    let baseTotal = basePrice * guestCount;

    // Add any BASE_MOD modifications (seasonal adjustments, etc.)
    const baseMods = sumPriceMods("BASE_MOD", baseTotal, guestCount);
    baseTotal += baseMods;

    // Calculate other modifications
    const discounts = sumPriceMods("DISCOUNT", baseTotal, guestCount);
    const fees = sumPriceMods("FEE", baseTotal, guestCount);
    const taxes = sumPriceMods("TAX", baseTotal, guestCount);
    const addons = sumPriceMods("ADDON", baseTotal, guestCount);

    return baseTotal + discounts + fees + taxes + addons;
  };

  const sumPriceMods = (
    type: ModifierType,
    baseTotal: number,
    guestCount: number
  ): number => {
    const applicableMods = priceMods.filter((mod) => {
      // Check if this is the type we're calculating
      if (mod.type !== type) return false;

      // Check date range if specified
      const currentDate = date?.from ?? new Date();
      if (mod.dateStart && mod.dateEnd) {
        if (currentDate < mod.dateStart || currentDate > mod.dateEnd) {
          return false;
        }
      }

      // Check guest count constraints
      if (mod.guestMin && guestCount < mod.guestMin) return false;
      if (mod.guestMax && guestCount > mod.guestMax) return false;

      return true;
    });

    return applicableMods.reduce((total, mod) => {
      if (mod.unit === "FIXED") {
        // For fixed amounts, just add the value
        return total + mod.value;
      } else if (mod.unit === "PERCENT") {
        // For percentages, calculate based on base total
        const percentValue = (baseTotal * mod.value) / 100;
        return total + percentValue;
      }
      return total;
    }, 0);
  };

  console.log("pm ", priceMods);
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">
          {toUSD(basePrice.value)}
          <Lead className="inline text-sm"> / </Lead>
          <Small>{event.duration} nights</Small>
        </CardTitle>
        <CardDescription>Fixed Booking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <DatePickerFixedRange
            className="w-full"
            selectedRange={date}
            setSelectedRange={setDate}
            duration={event.duration}
          />
        </div>
        <div className="mt-2 flex w-full">
          <ClickyCounter />
        </div>
      </CardContent>
      <CardContent>
        <TooltipProvider>
          {priceMods?.length > 0 ? (
            priceMods.map((mod, i) => (
              <Tooltip key={`price-mod-tt-${i}`}>
                <TooltipTrigger className="w-full">
                  <Small className="flex w-full cursor-help justify-between text-primary/60">
                    <span>{mod.name}</span>
                    <span>{toUSD(mod.value)}</span>
                  </Small>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] text-sm">
                  {mod.desc || "No description available"}
                </TooltipContent>
              </Tooltip>
            ))
          ) : (
            <P>---</P>
          )}
        </TooltipProvider>

        <Small className="flex justify-between text-lg text-primary/60">
          <span>
            {searchParams.get("guests") || "1"} guests x{" "}
            {toUSD(basePrice?.value)}
          </span>
          <span>
            {toUSD(
              parseInt(searchParams.get("guests") || "1") *
                (basePrice?.value ?? 1)
            )}
          </span>
        </Small>

        <P className="flex justify-between">
          <span className="text-primary/60">Total / pre-tax</span>
          <span>{toUSD(calculateTotal())}</span>
        </P>
      </CardContent>
      <CardFooter className="justify-end">
        <CheckoutButton
          uiMode="embedded"
          price={250}
          userId={userId}
          propertyId={retreat.propertyId}
          checkInDate={date?.from}
          checkOutDate={date?.to}
          guestCount={parseInt(searchParams.get("guests") || "1")}
        />
      </CardFooter>
    </Card>
  );
}
