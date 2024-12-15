"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parse } from "date-fns";
import { ChevronsUpDown } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const buttonClasses =
  "h-12 pb-0 w-full rounded rounded-b-none border-b-2 border-transparent border-b-black bg-transparent text-left shadow-none px-0";

export function BookingBarCalendar() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    if (fromParam) {
      const fromDate = parse(fromParam, "yyyy-MM-dd", new Date());
      setDate((prev) => ({ ...prev, from: fromDate }));
    }

    if (toParam) {
      const toDate = parse(toParam, "yyyy-MM-dd", new Date());
      setDate((prev) => ({ from: prev?.from, to: toDate }));
    }
  }, [searchParams]);

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (date?.from) {
      current.set("from", format(date.from, "yyyy-MM-dd"));
    } else {
      current.delete("from");
    }

    if (date?.to) {
      current.set("to", format(date.to, "yyyy-MM-dd"));
    } else {
      current.delete("to");
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${window.location.pathname}${query}`, { scroll: false });
  }, [date, router, searchParams]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex w-full items-center gap-x-4">
          <Button variant="outline" className={buttonClasses}>
            <span className="flex w-full items-center justify-between text-base">
              {date?.from
                ? `FROM ${format(date.from, "LLL dd, y").toUpperCase()}`
                : "CHECK IN"}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </span>
          </Button>

          <Button variant="outline" className={buttonClasses}>
            <span className="flex w-full items-center justify-between text-base">
              {date?.to
                ? `TO ${format(date.to, "LLL dd, y").toUpperCase()}`
                : "CHECK OUT"}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </span>
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
