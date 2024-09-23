"use client";

import React, { useEffect, useState } from "react";
import { format, parse } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { Small } from "../typography";
import { Separator } from "../ui/separator";
import { useRouter, useSearchParams } from 'next/navigation';

export function BookingBarCalendar() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });

    const router = useRouter();
    const searchParams = useSearchParams();

    const updateDate = (date: DateRange | undefined) => setDate(date);

    useEffect(() => {
        const fromParam = searchParams.get('from');
        const toParam = searchParams.get('to');

        if (fromParam) {
            const fromDate = parse(fromParam, 'yyyy-MM-dd', new Date());
            setDate(prev => ({ ...prev, from: fromDate }));
        }

        if (toParam) {
            const toDate = parse(toParam, 'yyyy-MM-dd', new Date());
            setDate(prev => ({ ...prev, to: toDate }));
        }
    }, [searchParams]);

    useEffect(() => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (date?.from) {
            current.set('from', format(date.from, 'yyyy-MM-dd'));
        } else {
            current.delete('from');
        }

        if (date?.to) {
            current.set('to', format(date.to, 'yyyy-MM-dd'));
        } else {
            current.delete('to');
        }

        const search = current.toString();
        const query = search ? `?${search}` : "";

        router.push(`${window.location.pathname}${query}`, { scroll: false });
    }, [date, router, searchParams]);

    return (
        <div className={cn("grid gap-2 w-full")}>
            <Popover>
                <PopoverTrigger asChild>
                    <div className="flex justify-around w-full h-12 items-center">
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "size-full text-left font-normal bg-transparent border-transparent rounded",
                                !date && "text-muted-foreground"
                            )}
                        >
                            {date?.from ? (
                                <DateDisplay date={date.from} />
                            ) : (
                                <DatePlaceholder />
                            )}
                        </Button>
                        <Separator
                            orientation="vertical"
                            className="h-full h-full mx-2 w-[0.5px]"
                        />
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "size-full text-left font-normal bg-transparent border-transparent rounded",
                                !date && "text-muted-foreground"
                            )}
                        >
                            {date?.to ? (
                                <DateDisplay date={date.to} to />
                            ) : (
                                <DatePlaceholder />
                            )}
                        </Button>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={updateDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

function DatePlaceholder({ checkIn = true }: { checkIn?: boolean; }) {
    return (
        <div className="w-full text-start">
            <div className="font-title text-xs">
                {checkIn ? "CHECK IN" : "CHECK OUT"}
            </div>
            <div className="font-tagline font-light text-xs text-rich-white/70">
                {checkIn ? "ARRIVAL DATE" : "DEPARTURE DATE"}
            </div>
        </div>
    );
}

function DateDisplay({ date, to = false }: { date: Date; to?: boolean; }) {
    return (
        <div className="w-full text-start">
            <Small className="block">{to ? "TO" : "FROM"}</Small>
            {format(date, "LLL dd, y")}
        </div>
    );
}
