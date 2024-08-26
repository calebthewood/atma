"use client";

import { useState } from "react";
import { PriceMod, Retreat, RetreatInstance } from "@prisma/client";
import {
  addDays,
  compareAsc,
  differenceInCalendarDays,
  format,
  formatDistance,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import CheckoutButton from "../checkout/checkout-button";
import { Large, Lead, P, Small } from "../typography";
import { DatePickerWithRange } from "../ui/date-pickers";
import { Separator } from "../ui/separator";

const today = new Date();

interface RetreatIntanceWithMods extends RetreatInstance {
  priceMods: PriceMod[];
}
interface BookingListProps {
  events: RetreatIntanceWithMods[];
  retreat: Retreat;
  userId: string | undefined;
}

/** This is the variable start, fixed duration picker. So a  user can start any day within the confines of the parent
 * retreat, but the duration is set. So this would be like preset 3-day retreats, or however long is set in the parent
 * retreat. DatePicker here will always have a set length, but you can move around thew start date.
 *
 * Note that the flexible_range retreats need only 1 retreat instance.
 */
export function FlexibleBooking({ userId, retreat, events }: BookingListProps) {
  const [priceMods, setPriceMods] = useState<PriceMod[]>(
    events[0]?.priceMods || []
  );
  const [guestCount, setGuestCount] = useState(retreat.minGuests);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });

  const updateDate = (date: DateRange | undefined) => setDate(date);

  const sumPriceMods = () => {
    let total = 0;
    for (const mod of priceMods) {
      total += mod.value;
      // this will likely be more complex as price mods can be %, flat rate, daily, etc
    }
    return total;
  };

  const dateDiffDisplay = () => {
    if (!date || !date.to || !date.from) return -1;
    return formatDistance(date.to, date.from);
  };
  const dateDiffNumber = () => {
    if (!date || !date.to || !date.from) return -1;
    return differenceInCalendarDays(date?.to, date?.from);
  };

  const duration = dateDiffNumber();

  const calculateTotal = () => {
    let base = Number(retreat.price); // asssume there will be a guest modfier. Some events will not upcharge for guests some will, and it may not be base * guestCount
    let priceMod = sumPriceMods();
    return base * guestCount * duration + priceMod;
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>
          {toUSD(Number(retreat.price))} <Small>night</Small>
        </CardTitle>
        <CardDescription>Flexible Booking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <DatePickerWithRange
            className="w-full"
            date={date}
            updateDate={updateDate}
          />
        </div>
        <div className="flex w-full mt-2">
          <GuestSelect
            guestCount={guestCount}
            handleGuests={(val: string) => setGuestCount(Number(val))}
            minGuests={retreat.minGuests}
            maxGuests={retreat.maxGuests}
          />
        </div>
      </CardContent>
      <CardContent>
        <P className="flex justify-between text-lg">
          <span>
            {guestCount} guests x ${Number(retreat.price)}
          </span>
          <span>{toUSD(guestCount * Number(retreat.price) * guestCount)}</span>
        </P>
        <P className="flex justify-between text-lg">
          <span>
            {dateDiffDisplay()} x ${guestCount * Number(retreat.price)}
          </span>
          <span>{toUSD(duration * Number(retreat.price) * guestCount)}</span>
        </P>

        {priceMods?.length > 0 ? (
          priceMods.map((mod, i) => (
            <Small
              key={`price-mod-${i}`}
              className="flex justify-between text-primary/60"
            >
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
          price={Number(retreat.price)}
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

interface GuestSelectProps {
  guestCount: number;
  handleGuests: (val: string) => void;
  minGuests: number;
  maxGuests: number;
}

function GuestSelect({
  guestCount,
  handleGuests,
  minGuests,
  maxGuests,
}: GuestSelectProps) {
  const arrayRange = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step + 1 }, (_, index) => {
      const value = start + index * step;
      const name = value === 1 ? "Guest" : "Guests";
      return { name: `${value} ${name}`, value: String(value) };
    });

  const guests = arrayRange(minGuests, maxGuests, 1);

  return (
    <Select onValueChange={handleGuests} defaultValue={String(guestCount)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Guests" />
      </SelectTrigger>
      <SelectContent>
        {guests.map((g) => (
          <SelectItem key={g.name} value={g.value}>
            {g.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
