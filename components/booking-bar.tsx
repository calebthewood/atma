"use client";

import React from "react";

import { BookingBarCalendar } from "./booking/booking-bar-calendar";
import { PurposeCombobox } from "./purposes-combobox";
import { GuestCombobox } from "./ui/guest-combobox";
import { LocationCombobox } from "./ui/location-combobox";
import SearchButton from "./ui/search-button";

export function BookingBar() {
  return (
    <div className="z-50 mb-24 flex w-full flex-col gap-2 md:flex-row md:justify-between container">
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
