"use client";

import { useState } from "react";
import { RetreatWithRelations } from "@/actions/retreat-actions";
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
import { ClickyCounter } from "../counter";
import { Large, Lead, P, Small } from "../typography";
import { DatePickerWithRange } from "../ui/date-pickers";
import { Separator } from "../ui/separator";
import { GuestSelect } from "./guest-select";

interface RetreatIntanceWithMods extends RetreatInstance {
  priceMods: PriceMod[];
}
interface BookingListProps {
  events: RetreatIntanceWithMods[];
  retreat: RetreatWithRelations;
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
  const [guestCount, setGuestCount] = useState(retreat.minGuests ?? 1);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });

  const updateDate = (date: DateRange | undefined) => setDate(date);

  const sumPriceMods = () => {
    let total = 0;
    for (const mod of priceMods) {
      total += mod.value ?? 0;
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
  // @ts-ignore
  const prices = retreat?.priceMods ?? [];
  // @ts-ignore
  const basePrice = prices.find((p) => p.name?.toLowerCase().includes("base"));

  const calculateTotal = () => {
    let base = basePrice?.value ?? 0; // asssume there will be a guest modfier. Some events will not upcharge for guests some will, and it may not be base * guestCount
    let priceMod = sumPriceMods();

    return base * 1 * duration + priceMod;
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>
          {toUSD(basePrice?.value)} <Small> / night</Small>
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
        <div className="mt-2 flex w-full">
          {/* <ClickyCounter
            incrementor={(val) => setGuestCount(Number(val) + 1)}
            decrementor={(val) => setGuestCount(Number(val) - 1)}
            count={guestCount ?? 1}
          /> */}
          <GuestSelect
            guestCount={guestCount ?? 1}
            handleGuests={(val: string) => setGuestCount(Number(val))}
            minGuests={retreat.minGuests ?? 1}
            maxGuests={retreat.maxGuests ?? 16}
          />
        </div>
      </CardContent>
      <CardContent>
        <Small className="flex justify-between text-lg text-primary/60">
          <span>
            {guestCount} guests x {toUSD(basePrice?.value)}
          </span>
          <span>{toUSD((guestCount ?? 1) * (basePrice?.value ?? 1))}</span>
        </Small>
        <Small className="flex justify-between text-lg text-primary/60">
          <span>
            {dateDiffDisplay()} x ${(guestCount ?? 1) * (basePrice?.value ?? 1)}
          </span>
          <span>
            {toUSD(duration * (guestCount ?? 1) * (basePrice?.value ?? 1))}
          </span>
        </Small>

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
          <P>---</P>
        )}

        <P className="flex justify-between">
          <span className="text-primary/60">Total / pre-tax</span>
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
          guestCount={guestCount ?? 1}
        />
      </CardFooter>
    </Card>
  );
}
