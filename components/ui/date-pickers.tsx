"use client";

import * as React from "react";
import { addDays, format, isWithinInterval, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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
import { Separator } from "./separator";

interface DatePickerProps {
  date: Date | undefined;
  handleDate: (val: Date | undefined) => void;
}

export function DatePicker({ date, handleDate }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {date ? format(date, "EEE, MMM dd") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  updateDate: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  date,
  updateDate,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "size-full text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            {date?.from ? (
              date.to ? (
                <div className="flex w-full justify-evenly">
                  <div className="">
                    <Small className="block">From</Small>
                    {format(date.from, "LLL dd, y")}
                  </div>
                  <Separator
                    orientation="vertical"
                    className="mx-8 my-auto h-8"
                  />
                  <div className="">
                    <Small className="block">To</Small>
                    {format(date.to, "LLL dd, y")}
                  </div>
                </div>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
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

interface DatePickerFixedRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  selectedRange: DateRange | undefined;
  setSelectedRange: (date: DateRange | undefined) => void;
  duration: number;
  disabled?: boolean;
}

export function DatePickerFixedRange({
  className,
  selectedRange,
  setSelectedRange,
  duration,
  disabled = false,
}: DatePickerFixedRangeProps) {
  const isInRange = (date: Date) => {
    if (!selectedRange?.to || !selectedRange?.from) return false;
    return isWithinInterval(date, {
      start: selectedRange.from,
      end: selectedRange.to,
    });
  };
  /** Checks mid range so calendar can show gray for range and black for start/end dates */
  const isMidRange = (date: Date) => {
    if (!selectedRange?.to || !selectedRange?.from) return false;
    return isWithinInterval(date, {
      start: addDays(selectedRange.from, 1),
      end: subDays(selectedRange.to, 1),
    });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            id="selectedRange"
            variant={"outline"}
            className={cn(
              "size-full justify-evenly text-left font-normal",
              !selectedRange && "text-muted-foreground"
            )}
          >
            {selectedRange?.from ? (
              selectedRange.to ? (
                <div className="flex w-full justify-evenly">
                  <div className="">
                    <Small className="block">From</Small>
                    {format(selectedRange.from, "LLL dd, y")}
                  </div>
                  <Separator
                    orientation="vertical"
                    className="mx-8 my-auto h-8 flex-none"
                  />
                  <div className="">
                    <Small className="block">To</Small>
                    {format(selectedRange.to, "LLL dd, y")}
                  </div>
                </div>
              ) : (
                format(selectedRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedRange?.from}
            onSelect={(day) => {
              if (!day) return;
              setSelectedRange({
                from: day,
                to: addDays(day, duration), // Subtract 1 to include the start day
              });
            }}
            numberOfMonths={2}
            modifiers={{
              selected: (date) => isInRange(date),
              range_start: (date) =>
                date.getTime() === selectedRange?.from?.getTime(),
              range_end: (date) =>
                date.getTime() === selectedRange?.to?.getTime(),
              range_middle: (date) => isMidRange(date),
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
