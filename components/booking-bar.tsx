"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { searchNearbyPlaces } from "@/actions/location-actions";
import { PropertiesWithImages } from "@/actions/property-actions";
import { addDays } from "date-fns";
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
    <div className="w-full flex flex-row justify-between mt-6">
      <div className="h-16 grow flex flex-row rounded border justify-evenly items-center bg-white/20 backdrop-blur p-2 shadow">
        <div className="basis-3/12">
          <LocationCombobox />
        </div>
        <Separator orientation="vertical" className="h-full mx-2  w-[0.5px]" />
        <div className="basis-6/12">
          <BookingBarCalendar />
        </div>
        <Separator orientation="vertical" className="h-full mx-2  w-[0.5px]" />
        <div className="basis-2/12">
          <GuestCombobox />
        </div>
      </div>
      <Button
        variant={"outline"}
        asChild
        className="h-16 w-20 ml-2 p-4 dark:bg-white/20 dark:hover:bg-white/10 dark:hover:stroke-white cursor-pointer rounded border flex justify-center items-center align-center backdrop-blur shadow"
      >
        <Link href={constructSearchUrl()}>
          <Search className="" strokeWidth={0.5} />
        </Link>
      </Button>
    </div>
  );
}
