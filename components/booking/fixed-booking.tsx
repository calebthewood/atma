"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProgramWithAllRelations } from "@/actions/program-actions";
import { type RetreatWithBasicRelations } from "@/actions/retreat-actions";
import { getUser } from "@/actions/user-actions";
import {
  PriceMod,
  type ProgramInstance,
  type RetreatInstance,
} from "@prisma/client";
import { addDays, format, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";

import { calculatePriceMods, toUSD } from "@/lib/utils";
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
  item: ProgramWithAllRelations | RetreatWithBasicRelations;
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
  const guestCount = parseInt(searchParams.get("guests") || "1");

  const instanceId = searchParams.get("instance");

  const maxGuests =
    item?.maxGuests && item?.maxGuests > 0 ? item.maxGuests : 16;

  const basePrice = priceMods.find((mod) =>
    mod.type === "BASE_PRICE" && type === "program"
      ? mod.programInstanceId === instanceId
      : mod.retreatInstanceId === instanceId
  );

  const [currentInstance, setCurrentInstance] = useState(() =>
    instances.find((i) => i?.id === instanceId)
  );

  console.log(priceMods);

  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (type === "retreat" && instances.length > 0) {
      const inst = instances[0];
      return {
        from: inst.startDate,
        to: inst.endDate,
      };
    } else {
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
    }
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

  useEffect(() => {
    setCurrentInstance(instances.find((i) => i?.id === instanceId));
  }, [instanceId, instances]);

  const getPriceModsByType = (type: string) => {
    return priceMods.filter((mod) => mod.type === type);
  };

  const calculateSubtotal = () => {
    return basePrice ? basePrice.value * guestCount : 0;
  };

  const singlePrice = calculatePriceMods(
    priceMods.filter((mod) =>
      type === "program"
        ? mod.programInstanceId === instanceId
        : mod.retreatInstanceId === instanceId
    )
  );
  const total = singlePrice * guestCount; // refactor when adding more complex pricing.

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

  return (
    <Card className="m-1 min-w-fit max-w-md md:p-0">
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
            disabled={type === "retreat"}
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

          <Small className="flex justify-between text-lg text-primary/60">
            <span>
              {toUSD(basePrice?.value)} X {guestCount} guest
              {guestCount > 1 ? "s" : ""}
            </span>

            <span>{toUSD(calculateSubtotal())}</span>
          </Small>
          <div className="mt-4 border-t pt-4">
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
          hostId={item.hostId}
          price={total}
          userId={userId}
          entity={type}
          entityId={instanceId || ""}
          propertyId={item.propertyId}
          checkInDate={date?.from}
          checkOutDate={date?.to}
          guestCount={parseInt(searchParams.get("guests") || "1")}
        />
      </CardFooter>
    </Card>
  );
}
