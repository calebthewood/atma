"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { BookingBarCalendar } from "./booking/booking-bar-calendar";
import { Button } from "./ui/button";
import { GuestCombobox, LocationCombobox } from "./ui/location-combobox";
import { Separator } from "./ui/separator";

export function BookingBar() {
  const searchParams = useSearchParams();

  const constructSearchUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    return `/search?${params.toString()}`;
  }, [searchParams]);

  return (
    <div className="z-50 mt-6 flex w-full flex-col gap-2 px-2 md:container md:flex-row md:justify-between">
      <div className="flex w-full flex-col gap-2 rounded border bg-white/20 p-4 shadow backdrop-blur md:min-h-16 md:flex-row md:items-center md:gap-0 md:p-2">
        <div className="w-full md:basis-3/12">
          <LocationCombobox />
        </div>
        <Separator
          orientation="horizontal"
          className="my-2 h-[0.5px] w-full md:hidden"
        />
        <Separator
          orientation="vertical"
          className="mx-2 hidden h-full w-[0.5px] md:block"
        />
        <div className="w-full md:basis-6/12">
          <BookingBarCalendar />
        </div>
        <Separator
          orientation="horizontal"
          className="my-2 h-[0.5px] w-full md:hidden"
        />
        <Separator
          orientation="vertical"
          className="mx-2 hidden h-full w-[0.5px] md:block"
        />

        <div className="w-full md:basis-3/12">
          <GuestCombobox />
        </div>
      </div>

      {/* Search Button */}
      <Button
        asChild
        variant={"outline"}
        className="flex h-16 w-full cursor-pointer items-center justify-center rounded border bg-white/20 p-4 shadow backdrop-blur-sm md:ml-2 md:w-20"
      >
        <Link href={constructSearchUrl()}>
          <Search className="" size={32} strokeWidth={0.75} />
        </Link>
      </Button>
    </div>
  );
}
