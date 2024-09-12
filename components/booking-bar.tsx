"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

import { Separator } from "./ui/separator";
import { LocationCombobox } from "./ui/location-combobox";
import { BookingBarCalendar } from "./booking/booking-bar-calendar";
import { GuestSelect } from "./booking/guest-select";
import { GuestCombobox } from "./ui/location-combobox";

export function BookingBar() {

    return (
        <div className="w-full flex flex-row justify-between mt-6">
            <div className="h-16 grow flex flex-row rounded border justify-evenly items-center bg-white/20 backdrop-blur p-2 shadow">
                <LocationCombobox />
                <Separator orientation="vertical" className="h-full mx-2  bg-rich-white w-[0.5px]" />
                <BookingBarCalendar />
                <Separator orientation="vertical" className="h-full mx-2  bg-rich-white w-[0.5px]" />
                <GuestCombobox />
            </div>
            <div className="h-16 w-20 ml-2 rounded border flex justify-center items-center align-center bg-white/20  backdrop-blur shadow">
                <Search strokeWidth={0.5} />
            </div>
        </div>
    );
}
