"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { searchNearbyPlaces } from "@/actions/location-actions";
import { PropertiesWithImages } from "@/actions/property-actions";
import { addDays } from "date-fns";
import { Search } from "lucide-react";

import { BookingBarCalendar } from "./booking/booking-bar-calendar";
import { Button } from "./ui/button";
import { GuestCombobox, LocationCombobox } from "./ui/location-combobox";
import { Separator } from "./ui/separator";

export function BookingBar({
  updateResults,
}: {
  updateResults: (list: PropertiesWithImages[]) => void;
}) {
  const searchParams = useSearchParams();

  const handleSearch = async () => {
    const encodedPlace = searchParams.get("place");
    const place = encodedPlace ? decodeURIComponent(encodedPlace) : "";
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const guests = searchParams.get("guests");

    const today = new Date();
    const twoDaysFromNow = addDays(today, 2);

    const searchCriteria = {
      place: place || "",
      lat: lat ? parseFloat(lat) : null,
      lon: lon ? parseFloat(lon) : null,
      from: from ? new Date(from) : today,
      to: to ? new Date(to) : twoDaysFromNow,
      guests: guests ? parseInt(guests, 10) : 1,
    };

    if (searchCriteria.lat && searchCriteria.lon) {
      console.log("Searching with criteria:", searchCriteria);

      const places = await searchNearbyPlaces(
        searchCriteria.lat,
        searchCriteria.lon,
        200
      );
      console.log("places  ", places);
      if (places) {
        updateResults(places);
      }
    } else {
      console.log("Cannot search without location coordinates");
      // TODO: highlight or focus location input if user searches withoutout anything
    }
  };

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
        onClick={handleSearch}
        className="h-16 w-20 ml-2 p-4 dark:bg-white/20 dark:hover:bg-white/10 dark:hover:stroke-white cursor-pointer rounded border flex justify-center items-center align-center backdrop-blur shadow"
      >
        <Search className="" strokeWidth={0.5} />
      </Button>
    </div>
  );
}
