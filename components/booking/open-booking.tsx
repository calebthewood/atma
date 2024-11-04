"use client";

import React from "react";
import { RetreatWithPrice } from "@/actions/retreat-actions";
import { PriceMod, Retreat, RetreatInstance } from "@prisma/client";
import { compareAsc, format } from "date-fns";

import { sumPriceList, toUSD } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Lead, Small } from "../typography";
import { DatePicker } from "../ui/date-pickers";
import { GuestCombobox } from "../ui/location-combobox";
import { Separator } from "../ui/separator";

const today = new Date();

interface PriceDisplayProps {
  prices: PriceMod[] | null;
}

function PriceDisplay({ prices }: PriceDisplayProps) {
  return (
    <CardHeader>
      <CardTitle>
        {prices ? toUSD(prices[0].value) : "-"} <Small>/ retreat</Small>
      </CardTitle>
      <CardDescription>Event Booking</CardDescription>
    </CardHeader>
  );
}

interface DateSelectionProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

function DateSelection({ date, onDateChange }: DateSelectionProps) {
  return (
    <div className="flex items-center space-x-4">
      <Small>From</Small>
      <DatePicker date={date} handleDate={onDateChange} />
      <GuestCombobox />
    </div>
  );
}

interface PriceItemProps {
  price: PriceMod;
}

function PriceItem({ price }: PriceItemProps) {
  return (
    <p className="text-sm font-semibold">
      {toUSD(price.value)} <span className="font-normal">/ {price.name}</span>
    </p>
  );
}

interface PriceSummaryProps {
  prices: PriceMod[] | null;
}

function PriceSummary({ prices }: PriceSummaryProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Small className="">{toUSD(sumPriceList(prices))}</Small>
          <Lead className="mr-1 inline text-xs"> / pre tax</Lead>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">
          <p>Proceed to checkout to view total cost including taxes & fees</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface BookingItemProps {
  item: RetreatInstance;
  retreat: RetreatWithPrice;
  guestCount: number;
  userId: string | undefined;
  prices: PriceMod[] | null;
}

function BookingItem({
  userId,
  item,
  retreat,
  guestCount,
  prices,
}: BookingItemProps) {
  const start = format(item.startDate, "EEE, MMM dd");
  const end = format(item.endDate, "EEE, MMM dd");
  const basePrice = 250;
  const adjustedPrice = basePrice * guestCount;

  return (
    <div className="flex flex-row">
      <div className="flex basis-1/2 flex-col">
        <Lead className="text-sm">
          {start} to {end}
        </Lead>
        {prices?.map((price, index) => (
          <PriceItem key={price.id || index} price={price} />
        ))}
      </div>
      <div className="flex basis-1/2 flex-col items-end">
        <PriceSummary prices={prices} />
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
  );
}

interface BookingEventsListProps {
  events: RetreatInstance[];
  retreat: RetreatWithPrice;
  userId: string | undefined;
  guestCount: number;
  prices: PriceMod[] | null;
}

function BookingEventsList({
  events,
  retreat,
  userId,
  guestCount,
  prices,
}: BookingEventsListProps) {
  return (
    <CardContent>
      {events.map((event, index) => (
        <div key={event.id || index}>
          <BookingItem
            userId={userId}
            guestCount={guestCount}
            retreat={retreat}
            item={event}
            prices={prices}
          />
          <Separator className="col-span-5 mx-auto my-6 w-11/12" />
        </div>
      ))}
    </CardContent>
  );
}

interface OpenBookingProps {
  events: RetreatInstance[];
  retreat: RetreatWithPrice;
  userId: string | undefined;
}

export function OpenBooking({ userId, retreat, events }: OpenBookingProps) {
  const [guestCount, setGuestCount] = React.useState(retreat.minGuests || 1);
  const [date, setDate] = React.useState<Date | undefined>(today);

  const displayed = React.useMemo(
    () => events?.filter((e) => compareAsc(e.startDate, date ?? today) === 1),
    [events, date]
  );

  return (
    <Card>
      <PriceDisplay prices={retreat.priceMods} />
      <CardContent>
        <DateSelection date={date} onDateChange={setDate} />
      </CardContent>
      <BookingEventsList
        events={displayed}
        retreat={retreat}
        userId={userId}
        guestCount={guestCount}
        prices={retreat.priceMods}
      />
    </Card>
  );
}
