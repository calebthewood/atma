"use client";
import React, { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import {
    addDays,
    format,
} from "date-fns";
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

export function BookingBarCalendar() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });

    const updateDate = (date: DateRange | undefined) => setDate(date);

    return (
        <div className={cn("grid gap-2 w-full")}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "size-full text-left font-normal bg-transparent border-transparent",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <div className="flex justify-between w-full h-12 items-center">
                            {date?.to
                                ? <DateDisplay date={date.to} to />
                                : <DatePlaceholder />}
                            <Separator
                                orientation="vertical"
                                className="h-full h-full mx-2 bg-rich-white w-[0.5px]"
                            />
                            {date?.from
                                ? <DateDisplay date={date.from} />
                                : <DatePlaceholder />}
                        </div>
                    </Button>
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
            <div className="font-title text-xs">{checkIn ? 'CHECK IN' : 'CHECK OUT'}</div>
            <div className="font-tagline font-light text-xs text-rich-white/70">{checkIn ? 'ARRIVAL DATE' : 'DEPARTURE DATE'}</div>
        </div>
    );
}

function DateDisplay({ date, to = false }: { date: Date; to?: boolean; }) {
    return (
        <div className="w-full text-start">
            <Small className="block">{to ? 'TO' : 'FROM'}</Small>
            {format(date, "LLL dd, y")}
        </div>
    );
}