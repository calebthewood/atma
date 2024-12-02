"use client";
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

interface BookingItemInstance extends RetreatInstance, ProgramInstance {
  priceMods: PriceMod[];
}

interface BookingProps {
  type: "program" | "retreat";
  item: ProgramWithBasicRelations | RetreatWithRelations;
  instance: BookingItemInstance;
  userId: string | undefined;
}

export function FixedBooking({ userId, type, item, instance }: BookingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize maxGuests (fallback to 16 if not specified)
  const maxGuests =
    item?.maxGuests && item?.maxGuests > 0 ? item.maxGuests : 16;

  // Get prices and base price
  const priceMods = instance?.priceMods || [];
  const basePrice =
    priceMods.find((p) => p.type === "BASE_PRICE") ?? priceMods[0];

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
      to: addDays(today, instance?.duration || 1),
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

  const calculateTotal = () => {
    const guestCount = parseInt(searchParams.get("guests") || "1");
    const basePriceMod = priceMods.find((mod) => mod.type === "BASE_PRICE");
    const basePrice = basePriceMod?.value ?? 250;

    let baseTotal = basePrice * guestCount;

    // Apply base modifications (seasonal adjustments)
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
    type: "BASE_PRICE" | "DISCOUNT" | "FEE" | "TAX" | "ADDON" | "BASE_MOD",
    baseTotal: number,
    guestCount: number
  ): number => {
    const applicableMods = priceMods.filter((mod) => {
      if (mod.type !== type) return false;

      const currentDate = date?.from ?? new Date();
      if (mod.dateStart && mod.dateEnd) {
        if (currentDate < mod.dateStart || currentDate > mod.dateEnd) {
          return false;
        }
      }

      if (mod.guestMin && guestCount < mod.guestMin) return false;
      if (mod.guestMax && guestCount > mod.guestMax) return false;

      return true;
    });

    return applicableMods.reduce((total, mod) => {
      if (mod.unit === "FIXED") {
        return total + mod.value;
      } else if (mod.unit === "PERCENT") {
        const percentValue = (baseTotal * mod.value) / 100;
        return total + percentValue;
      }
      return total;
    }, 0);
  };
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">
          {basePrice ? toUSD(basePrice.value) : "Price on request"}
          <Lead className="inline text-sm"> / </Lead>
          <Small>{instance.duration} nights</Small>
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
            duration={instance.duration}
          />
        </div>
        <div className="mt-2 flex w-full">
          <ClickyCounter />
        </div>
      </CardContent>
      <CardContent>
        <TooltipProvider>
          {priceMods.map((mod, i) => (
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
          ))}

          <div className="mt-4 border-t pt-4">
            <Small className="flex justify-between text-lg text-primary/60">
              <span>
                {searchParams.get("guests") || "1"} guests x{" "}
                {basePrice ? toUSD(basePrice.value) : "TBD"}
              </span>
              <span>
                {basePrice
                  ? toUSD(
                      parseInt(searchParams.get("guests") || "1") *
                        basePrice.value
                    )
                  : "TBD"}
              </span>
            </Small>

            <P className="mt-2 flex justify-between font-semibold">
              <span className="text-primary/60">Total (pre-tax)</span>
              <span>{toUSD(calculateTotal())}</span>
            </P>
          </div>
        </TooltipProvider>
      </CardContent>
      <CardFooter className="justify-end">
        <CheckoutButton
          uiMode="embedded"
          price={calculateTotal()}
          userId={userId}
          propertyId={item.propertyId}
          // type={type}
          // itemId={item.id}
          // instanceId={instance.id}
          checkInDate={date?.from}
          checkOutDate={date?.to}
          guestCount={parseInt(searchParams.get("guests") || "1")}
        />
      </CardFooter>
    </Card>
  );
}
