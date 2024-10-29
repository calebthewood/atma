"use client";

import React, { useEffect, useState } from "react";
import { getRetreatPrices } from "@/actions/retreat-actions";
import { PriceMod, Retreat, RetreatInstance } from "@prisma/client";
import { compareAsc, format } from "date-fns";

import prisma from "@/lib/prisma";
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
import { Large, Lead, Small } from "../typography";
import { DatePicker } from "../ui/date-pickers";
import { Separator } from "../ui/separator";
import { GuestSelect } from "./guest-select";

const today = new Date();

interface BookingListProps {
  events: RetreatInstance[];
  retreat: Retreat;
  userId: string | undefined;
}
/** Component for making open bookings. Any start & any end, within whatever parameters set by parent retreat
 * DatePicker will be a variable range between 2 points. Will need to show unavailable days. Like for example, maybe
 * the user can book any range, but it cant go over a monday.
 */
export function OpenBooking({ userId, retreat, events }: BookingListProps) {
  const [guestCount, setGuestCount] = useState(retreat.minGuests);
  const [date, setDate] = useState<Date | undefined>(today);
  const [prices, setPrices] = useState<PriceMod[] | null>(null);

  const comesAfter = (a: Date, b: Date) => compareAsc(a, b) === 1;
  const displayed = events?.filter((e) =>
    comesAfter(e.startDate, date ?? today)
  );

  useEffect(() => {
    async function fetchPrices() {
      const res = await getRetreatPrices(retreat.id);
      if (res.success && res.prices) {
        setPrices(res.prices);
      }
    }
    fetchPrices();
  }, [retreat]);

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>
          $XXXX
          {/* {toUSD(Number(retreat.price))} <Small>base price</Small> */}
        </CardTitle>
        <CardDescription>Event Booking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Small>From</Small>
          <DatePicker date={date} handleDate={setDate} />
          <GuestSelect
            guestCount={guestCount ?? 1}
            handleGuests={(val: string) => setGuestCount(Number(val))}
            minGuests={retreat.minGuests ?? 1}
            maxGuests={retreat.maxGuests ?? 16}
          />
        </div>
      </CardContent>
      {displayed?.map((r, i) => (
        <CardContent key={i}>
          <BookingItem
            userId={userId}
            guestCount={guestCount ?? 1}
            retreat={retreat}
            item={r}
          />
        </CardContent>
      ))}
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
}

interface BookingItemProps {
  item: RetreatInstance;
  retreat: Retreat;
  guestCount: number;
  userId: string | undefined;
}

function BookingItem({ userId, item, retreat, guestCount }: BookingItemProps) {
  const start = format(item.startDate, "EEE, MMM dd");
  const end = format(item.endDate, "EEE, MMM dd");
  const basePrice = 250;
  // const basePrice = Number(retreat.price);
  const adjustedPrice = basePrice * guestCount;
  return (
    <>
      <div className="flex flex-row">
        <div className="flex basis-1/2 flex-col">
          <Large>{retreat.name}</Large>
          <Lead className="text-sm">
            {start} to {end}
          </Lead>
          <p className="text-sm font-semibold">
            {toUSD(basePrice)} <span className="font-normal">/ person</span>
          </p>
        </div>
        <div className="flex basis-1/2 flex-col items-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Small className="">{toUSD(adjustedPrice)}</Small>
                <Lead className="mr-1 inline text-xs"> / base price</Lead>
              </TooltipTrigger>
              <TooltipContent className="max-w-64">
                <p>
                  Proceed to checkout to view total cost including taxes & fees
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <CheckoutButton
            uiMode="embedded"
            price={adjustedPrice}
            userId={userId}
            propertyId={retreat.propertyId}
            checkInDate={item.startDate}
            checkOutDate={item.endDate}
            guestCount={guestCount}
          />
        </div>
      </div>
      <Separator className="col-span-5 my-4" />
    </>
  );
}
