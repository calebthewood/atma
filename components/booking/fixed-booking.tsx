"use client";
import { useState } from "react";
import CheckoutButton from "../checkout/checkout-button";
import { compareAsc, addDays, formatDistance, differenceInCalendarDays, isSameDay } from "date-fns";

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

import { H2, Large, P, Small, Lead } from "../typography";
import { DatePickerFixedRange } from "../ui/date-pickers";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { RetreatInstance, Retreat, PriceMod } from "@prisma/client";
import { format } from "date-fns";
import { toUSD } from "@/lib/utils";
import { DateRange } from "react-day-picker";

const today = new Date();

interface RetreatIntanceWithMods extends RetreatInstance {
    priceMods: PriceMod[];
}
interface BookingListProps {
    event: RetreatIntanceWithMods;
    retreat: Retreat;
}

/** This is the variable start, fixed duration picker. So a  user can start any day within the confines of the parent
 * retreat, but the duration is set. So this would be like preset 3-day retreats, or however long is set in the parent
 * retreat. DatePicker here will always have a set length, but you can move around thew start date.
 *
 * Note that the flexible_range retreats need only 1 retreat instance.
 */
export function FixedBooking({ retreat, event }: BookingListProps) {
    retreat.duration;
    const [priceMods, setPriceMods] = useState<PriceMod[]>(event.priceMods || []);
    const [guestCount, setGuestCount] = useState(retreat.minGuests);
    const [date, setDate] = useState<DateRange | undefined>({
        from: today,
        to: addDays(today, event.minNights)
    });

    const duration = event.minNights;

    const updateDate = (newDate: DateRange | undefined) => {
        console.log('Update Date: ', newDate);
        // if from unchanged, to changed, use to as new base
        if (newDate?.from && date?.from && isSameDay(newDate.from, date.from) && date.to) {
            const toDate = date?.from;
            setDate({ from: toDate, to: addDays(toDate, 3) });
            // else to unchanged, use from as base
        } else {
            // if (newDate?.to && date?.to && isSameDay(newDate.to, date.to) && date?.from) {
            const fromDate = date?.from;
            setDate({ from: fromDate, to: addDays(fromDate, duration) });
        }
    };

    const calculateTotal = () => {
        let base = Number(retreat.price) * duration; // asssume there will be a guest modfier. Some events will not upcharge for guests some will, and it may not be base * guestCount
        let priceMod = sumPriceMods();
        return (base * guestCount) + priceMod;
    };

    const sumPriceMods = () => {
        let total = 0;
        for (const mod of priceMods) {
            total += mod.value;
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
        <Card>
            <CardHeader>
                <CardTitle>{toUSD(Number(retreat.price) * duration)}<Lead className="inline"> / </Lead><Small>{duration} nights</Small></CardTitle>
                <CardDescription>Fixed Booking</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4">
                    <DatePickerFixedRange
                        className="w-full"
                        selectedRange={date}
                        setSelectedRange={setDate}
                        duration={duration} />
                </div>
                <div className="flex w-full mt-2">
                    <GuestSelect
                        guestCount={guestCount}
                        handleGuests={(val: string) => setGuestCount(Number(val))}
                        minGuests={retreat.minGuests}
                        maxGuests={retreat.maxGuests} />
                </div>
            </CardContent>
            <CardContent>
                <P className="flex justify-between text-lg">
                    <span>{guestCount} guests x ${retreat.price}</span>
                    <span>{toUSD(guestCount * Number(retreat.price))}</span>
                </P>
                <P className="flex justify-between text-lg">
                    <span>{dateDiffDisplay()} x ${guestCount * Number(retreat.price)}</span>
                    <span>{toUSD(dateDiffNumber() * Number(retreat.price) * duration)}</span>
                </P>

                {priceMods?.length > 0 ? priceMods.map((mod, i) => (
                    <Small className="flex justify-between text-primary/60">
                        <span>{mod.name}</span>
                        <span>{toUSD(mod.value)}</span>
                    </Small>
                )) : <P>No Price modifiers</P>}

                <P className="flex justify-between text-primary/60">
                    <span>Total</span>
                    <span>{toUSD(calculateTotal())}</span>
                </P>

            </CardContent>
            <CardFooter className="justify-end">
                <CheckoutButton
                    uiMode="embedded"
                    price={Number(retreat.price)} />
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

function GuestSelect({ guestCount, handleGuests, minGuests, maxGuests }: GuestSelectProps) {
    const arrayRange = (start: number, stop: number, step: number) =>
        Array.from(
            { length: (stop - start) / step + 1 },
            (_, index) => {
                const value = start + index * step;
                const name = value === 1 ? 'Guest' : 'Guests';
                return { name: `${value} ${name}`, value: String(value) };
            }
        );

    const guests = arrayRange(minGuests, maxGuests, 1);

    return (
        <Select onValueChange={handleGuests} defaultValue={String(guestCount)}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Guests" />
            </SelectTrigger>
            <SelectContent>
                {guests.map(g => <SelectItem key={g.name} value={g.value}>{g.name}</SelectItem>)}
            </SelectContent>
        </Select>
    );
}