"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { BookingBarCalendar } from "./booking/booking-bar-calendar";
import { PurposeCombobox } from "./purposes-combobox";
import { Button } from "./ui/button";
import { GuestCombobox } from "./ui/guest-combobox";
import { LocationCombobox } from "./ui/location-combobox";

export function BookingBar() {
  const searchParams = useSearchParams();

  const constructSearchUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    return `/search?${params.toString()}`;
  }, [searchParams]);

  const SearchButton = () => (
    <Button
      asChild
      variant={"outline"}
      className="w-full rounded-full text-base text-[#9b1025]"
    >
      <Link href={constructSearchUrl()}>SEARCH</Link>
    </Button>
  );

  return (
    <div className="z-50 flex w-full flex-col gap-2 px-2 md:container md:flex-row md:justify-between mb-24">
      <div className="flex w-full flex-col gap-2 md:min-h-16 md:flex-row md:items-center md:gap-x-4 md:p-2">
        <div className="w-full basis-2/12">
          <LocationCombobox />
        </div>
        <div className="w-full basis-2/12">
          <PurposeCombobox />
        </div>
        <div className="w-full basis-4/12">
          <BookingBarCalendar />
        </div>
        <div className="w-full basis-2/12">
          <GuestCombobox />
        </div>
        <div className="mt-2 flex w-full basis-2/12 flex-col items-center justify-center">
          <SearchButton />
        </div>
      </div>
    </div>
  );
}
