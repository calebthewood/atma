"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader } from "@googlemaps/js-api-loader";
import { Check, ChevronsUpDown, Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ClickyCounter } from "../counter";

interface Place {
  desc: string;
  place_id: string;
}

interface SelectedPlace {
  name: string;
  lat: number;
  lon: number;
}

export function LocationCombobox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<SelectedPlace | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesService, setPlacesService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [placesDetailsService, setPlacesDetailsService] =
    useState<google.maps.places.PlacesService | null>(null);
  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadPlacesLibrary = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "",
          version: "weekly",
          libraries: ["places"],
        });

        const google = await loader.load();
        const autocompleteService =
          new google.maps.places.AutocompleteService();
        setPlacesService(autocompleteService);

        // Create a dummy element for the PlacesService constructor
        const dummyElement = document.createElement("div");
        const detailsService = new google.maps.places.PlacesService(
          dummyElement
        );
        setPlacesDetailsService(detailsService);

        setSessionToken(new google.maps.places.AutocompleteSessionToken());
      } catch (error) {
        console.error("Error loading Google Places library:", error);
      }
    };

    loadPlacesLibrary();
  }, []);

  useEffect(() => {}, [value, setValue]);

  const handleInputChange = (input: string) => {
    if (placesService && sessionToken) {
      placesService.getPlacePredictions(
        {
          input,
          sessionToken,
          types: ["(regions)"],
        },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            //@ts-ignore
            setPlaces(predictions);
          }
        }
      );
    }
  };

  const handlePlaceSelect = (placeId: string, desc: string) => {
    if (placesDetailsService) {
      placesDetailsService.getDetails(
        {
          placeId: placeId,
          fields: ["name", "geometry"],
        },
        (place, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            place &&
            place.geometry &&
            place.geometry.location
          ) {
            setValue({
              name: desc,
              lat: place.geometry.location.lat(),
              lon: place.geometry.location.lng(),
            });
            setOpen(false);
          }
        }
      );
    }
  };

  useEffect(() => {
    if (value) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set("place", encodeURIComponent(value.name));
      current.set("lat", value.lat.toString());
      current.set("lon", value.lon.toString());

      const search = current.toString();
      const query = search ? `?${search}` : "";

      router.push(`${window.location.pathname}${query}`, { scroll: false });
    } else {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.delete("place");
      current.delete("lat");
      current.delete("lon");

      const search = current.toString();
      const query = search ? `?${search}` : "";

      router.push(`${window.location.pathname}${query}`, { scroll: false });
    }
  }, [value, setValue, router, searchParams]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-12 w-full justify-between rounded border-transparent bg-transparent pl-2 text-foreground shadow-none"
        >
          {value ? (
            value.name
          ) : (
            <Placeholder title="LOCATION" subtitle="CITY, COUNTRY OR REGION" />
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search for a location..."
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>No locations found.</CommandEmpty>
            <CommandGroup>
              {places.map((place) => (
                <CommandItem
                  key={place.place_id}
                  value={place.desc}
                  onSelect={() => handlePlaceSelect(place.place_id, place.desc)}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value?.name === place.desc ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {place.desc}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
function Placeholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="w-full text-start">
      <div className="font-title text-xs">{title}</div>
      <div className="font-tagline text-xs font-light opacity-70">
        {subtitle}
      </div>
    </div>
  );
}
export function GuestCombobox() {
  const [open, setOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const guestParam = searchParams.get("guests");
    if (guestParam) {
      setGuestCount(parseInt(guestParam, 10));
    }
  }, [searchParams]);

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (guestCount > 0) {
      current.set("guests", guestCount.toString());
    } else {
      current.delete("guests");
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${window.location.pathname}${query}`, { scroll: false });
  }, [guestCount, router, searchParams]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-12 w-full justify-between rounded border-transparent bg-transparent pl-2 shadow-none"
        >
          {guestCount > 0 ? (
            <Placeholder
              title="GUESTS"
              subtitle={`${guestCount} guest${guestCount !== 1 ? "s" : ""}`}
            />
          ) : (
            <Placeholder title="GUESTS" subtitle="ADD GUESTS" />
          )}
          {/* <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" /> */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-4">
        <ClickyCounter />
      </PopoverContent>
    </Popover>
  );
}
