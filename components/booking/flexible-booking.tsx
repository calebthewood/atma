"use client";
import { useState } from "react";
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

import { H2, Large, P, Small, Lead } from "../typography";
import { DatePicker } from "../ui/date-pickers";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { RetreatInstance, Retreat } from "@prisma/client";
import { format } from "date-fns";
import { toUSD } from "@/lib/utils";


const today = new Date();

interface BookingListProps {
    events: RetreatInstance[];
    retreat: Retreat;
}

export function FlexibleBooking({ retreat, events }: BookingListProps) {

    const [guestCount, setGuestCount] = useState(retreat.minGuests);
    const [calendarDate, setCalendarDate] = useState<Date | undefined>(today);

    const comesAfter = (a: Date, b: Date) => compareAsc(a, b) === 1;
    const displayed = events.filter((e) => comesAfter(e.startDate, calendarDate ?? today));

    return (
        <Card>
            <CardHeader>
                <CardTitle>$1,200 <Small>night</Small></CardTitle>
                <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4">
                    <Small>From</Small><br />
                    <DatePicker date={calendarDate} handleDate={(date) => setCalendarDate(date)} />
                    <GuestSelect
                        guestCount={guestCount}
                        handleGuests={(val: string) => setGuestCount(Number(val))}
                        minGuests={retreat.minGuests}
                        maxGuests={retreat.maxGuests} />
                </div>
            </CardContent>
            {displayed.map((r, i) => (
                <CardContent key={i} >
                    <BookingItem guestCount={guestCount} retreat={retreat} item={r} />
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
}

function BookingItem({ item, retreat, guestCount }: BookingItemProps) {
    const start = format(item.startDate, 'EEE, MMM dd');
    const end = format(item.endDate, 'EEE, MMM dd');
    const basePrice = Number(retreat.price);
    const adjustedPrice = basePrice * guestCount;
    return (
        <div className="grid cols-5">
            <div className="col-start-1 col-span-4">

                <Large>{retreat.name}</Large>
                <Lead className="text-sm">{start} to {end}</Lead>
                <p className="font-semibold text-sm">{toUSD(basePrice)} <span className="font-normal">/ person</span></p>
            </div>
            <div className="col-start-5 col-span-1 content-end">

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Small>{toUSD(adjustedPrice)}</Small><Lead className="text-xs inline">/ base price</Lead>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-64">
                            <p>Proceed to checkout to view total cost including taxes & fees</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <CheckoutButton
                    uiMode="embedded"
                    price={adjustedPrice} />
            </div>
            <Separator className="my-4 col-span-5" />
        </div>
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
                {guests.map(g => <SelectItem value={g.value}>{g.name}</SelectItem>)}
            </SelectContent>
        </Select>
    );
}