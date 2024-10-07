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
    <div className="mt-6 flex w-full flex-row justify-between">
      <div className="flex h-16 grow flex-row items-center justify-evenly rounded border bg-white/20 p-2 shadow backdrop-blur">
        <div className="basis-3/12">
          <LocationCombobox />
        </div>
        <Separator orientation="vertical" className="mx-2 h-full w-[0.5px]" />
        <div className="basis-6/12">
          <BookingBarCalendar />
        </div>
        <Separator orientation="vertical" className="mx-2 h-full w-[0.5px]" />
        <div className="basis-2/12">
          <GuestCombobox />
        </div>
      </div>
      <Button
        variant={"outline"}
        asChild
        className="align-center ml-2 flex h-16 w-20 cursor-pointer items-center justify-center rounded border p-4 shadow backdrop-blur dark:bg-white/20 dark:hover:bg-white/10 dark:hover:stroke-white"
      >
        <Link href={constructSearchUrl()}>
          <Search className="" size={32} strokeWidth={0.75} />
        </Link>
      </Button>
    </div>
  );
}
