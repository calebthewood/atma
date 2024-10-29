"use client";

import { useState } from "react";
import { PriceMod, Retreat, RetreatInstance } from "@prisma/client";
import {
  addDays,
  compareAsc,
  differenceInCalendarDays,
  format,
  formatDistance,
  isSameDay,
} from "date-fns";
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
import { H2, Large, Lead, P, Small } from "../typography";
import { Button } from "../ui/button";
import { DatePickerFixedRange } from "../ui/date-pickers";
import { Separator } from "../ui/separator";
import { GuestSelect } from "./guest-select";

const today = new Date();

interface RetreatIntanceWithMods extends RetreatInstance {
  priceMods: PriceMod[];
}
interface BookingListProps {
  event: RetreatIntanceWithMods;
  retreat: Retreat;
  userId: string | undefined;
}

/** This is the variable start, fixed duration picker. So a  user can start any day within the confines of the parent
 * retreat, but the duration is set. So this would be like preset 3-day retreats, or however long is set in the parent
 * retreat. DatePicker here will always have a set length, but you can move around the start date.
 *
 * Note that the flexible_range retreats need only 1 retreat instance.
 */
export function FixedBooking({ userId, retreat, event }: BookingListProps) {
  retreat.duration;
  const [priceMods, setPriceMods] = useState<PriceMod[]>(event.priceMods || []);
  const [guestCount, setGuestCount] = useState(retreat.minGuests || 1);
  const [date, setDate] = useState<DateRange | undefined>({
    from: today,
    to: addDays(today, event.minNights),
  });

  const duration = event.minNights;

  const calculateTotal = () => {
    // let base = Number(retreat.price) * duration; // asssume there will be a guest modfier. Some events will not upcharge for guests some will, and it may not be base * guestCount
    let base = 250 * duration;
    let priceMod = sumPriceMods();
    return base * guestCount + priceMod;
  };

  const sumPriceMods = () => {
    let total = 0;
    for (const mod of priceMods) {
      total += mod?.value ?? 0;
      // this will likely be more complex as price mods can be %, flat rate, daily, etc
    }
    return total;
  };

  const comesAfter = (a: Date, b: Date) => compareAsc(a, b) === 1;
  // const displayed = events.filter((e) => comesAfter(e.startDate, calendarDate ?? today));

  const dateDiffDisplay = () => {
    if (!date || !date.to || !date.from) return -1;
    return formatDistance(date.to, date.from);
  };

  const dateDiffNumber = () => {
    if (!date || !date.to || !date.from) return -1;
    return differenceInCalendarDays(date?.to, date?.from);
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>
          {/* {toUSD(Number(retreat.price) * duration)} */}
          {toUSD(250 * duration)}
          <Lead className="inline"> / </Lead>
          <Small>{duration} nights</Small>
        </CardTitle>
        <CardDescription>Fixed Booking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <DatePickerFixedRange
            className="w-full"
            selectedRange={date}
            setSelectedRange={setDate}
            duration={duration}
          />
        </div>
        <div className="mt-2 flex w-full">
          <GuestSelect
            guestCount={guestCount}
            handleGuests={(val: string) => setGuestCount(Number(val))}
            minGuests={retreat.minGuests ?? 1}
            maxGuests={retreat.maxGuests ?? 16}
          />
        </div>
      </CardContent>
      <CardContent>
        <P className="flex justify-between text-lg">
          <span>
            {/* {guestCount} guests x ${retreat.price} */}
            {guestCount} guests x $XXXX
          </span>
          <span>$XXXXX</span>
          {/* <span>{toUSD(guestCount * Number(retreat.price))}</span> */}
        </P>
        <P className="flex justify-between text-lg">
          <span>
            $XXXX
            {/* {dateDiffDisplay()} x ${guestCount * Number(retreat.price)} */}
          </span>
          <span>
            $XXXX
            {/* {toUSD(dateDiffNumber() * Number(retreat.price) * duration)} */}
          </span>
        </P>

        {priceMods?.length > 0 ? (
          priceMods.map((mod, i) => (
            <Small className="flex justify-between text-primary/60">
              <span>{mod.name}</span>
              <span>{toUSD(mod.value)}</span>
            </Small>
          ))
        ) : (
          <P>No Price modifiers</P>
        )}

        <P className="flex justify-between text-primary/60">
          <span>Total</span>
          <span>{toUSD(calculateTotal())}</span>
        </P>
      </CardContent>
      <CardFooter className="justify-end">
        <CheckoutButton
          uiMode="embedded"
          // price={Number(retreat.price)}
          price={250}
          userId={userId}
          propertyId={retreat.propertyId}
          checkInDate={date?.from}
          checkOutDate={date?.to}
          guestCount={guestCount}
        />
      </CardFooter>
    </Card>
  );
}
