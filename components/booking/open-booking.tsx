"use client";
import React, { useState } from "react";
import CheckoutButton from "../checkout/checkout-button";
import { compareAsc } from "date-fns";
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

import { Large, Small, Lead } from "../typography";
import { DatePicker } from "../ui/date-pickers";
import { Separator } from "../ui/separator";
import { RetreatInstance, Retreat } from "@prisma/client";
import { format } from "date-fns";
import { toUSD } from "@/lib/utils";


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
    const [date, setDate] = React.useState<Date | undefined>(today);

    const comesAfter = (a: Date, b: Date) => compareAsc(a, b) === 1;
    const displayed = events.filter((e) => comesAfter(e.startDate, date ?? today));

    return (
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle>{toUSD(Number(retreat.price))} <Small>base price</Small></CardTitle>
                <CardDescription>Event Booking</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4">
                    <Small>From</Small>
                    <DatePicker date={date} handleDate={setDate} />
                    <GuestSelect
                        guestCount={guestCount}
                        handleGuests={(val: string) => setGuestCount(Number(val))}
                        minGuests={retreat.minGuests}
                        maxGuests={retreat.maxGuests} />
                </div>
            </CardContent>
            {displayed.map((r, i) => (
                <CardContent key={i} >
                    <BookingItem userId={userId} guestCount={guestCount} retreat={retreat} item={r} />
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
    const start = format(item.startDate, 'EEE, MMM dd');
    const end = format(item.endDate, 'EEE, MMM dd');
    const basePrice = Number(retreat.price);
    const adjustedPrice = basePrice * guestCount;
    return (
    <>
        <div className="flex flex-row">
            <div className="basis-1/2 flex flex-col">
                <Large>{retreat.name}</Large>
                <Lead className="text-sm">{start} to {end}</Lead>
                <p className="font-semibold text-sm">{toUSD(basePrice)} <span className="font-normal">/ person</span></p>
            </div>
            <div className="basis-1/2 flex flex-col items-end">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Small className="">{toUSD(adjustedPrice)}</Small><Lead className="text-xs inline mr-1"> / base price</Lead>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-64">
                            <p>Proceed to checkout to view total cost including taxes & fees</p>
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
                    guestCount={guestCount} />
            </div>
        </div>
        <Separator className="my-4 col-span-5" />
    </>
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
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Guests" />
            </SelectTrigger>
            <SelectContent>
                {guests.map(g => <SelectItem key={`guest-${g.value}`} value={g.value}>{g.name}</SelectItem>)}
            </SelectContent>
        </Select>
    );
}