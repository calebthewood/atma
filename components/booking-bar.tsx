"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { BookingBarCalendar } from "./booking/booking-bar-calendar";
import { GuestSelect } from "./booking/guest-select";
import { GuestCombobox, LocationCombobox } from "./ui/location-combobox";
import { Separator } from "./ui/separator";

export function BookingBar() {
  return (
    <div className="w-full flex flex-row justify-between mt-6">
      <div className="h-16 grow flex flex-row rounded border justify-evenly items-center bg-white/20 backdrop-blur p-2 shadow">
        <LocationCombobox />
        <Separator
          orientation="vertical"
          className="h-full mx-2  bg-rich-white w-[0.5px]"
        />
        <BookingBarCalendar />
        <Separator
          orientation="vertical"
          className="h-full mx-2  bg-rich-white w-[0.5px]"
        />
        <GuestCombobox />
      </div>
      <div className="h-16 w-20 ml-2 rounded border flex justify-center items-center align-center bg-white/20  backdrop-blur shadow">
        <Search strokeWidth={0.5} />
      </div>
    </div>
  );
}
