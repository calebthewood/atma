"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePlacesAutocomplete } from "@/hooks/use-places-autocomplete";
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
import {
  AsiaIcon,
  EuropeIcon,
  NorthAmericaIcon,
  SouthAmericaIcon,
} from "@/components/geography/lo-res";

interface SelectedPlace {
  name: string;
  lat: number;
  lon: number;
  continent?: string;
}

const DEFAULT_CONTINENTS = [
  {
    id: "asia",
    name: "Asia",
    icon: AsiaIcon,
    lat: 34.047863,
    lon: 100.619655,
  },
  {
    id: "europe",
    name: "Europe",
    icon: EuropeIcon,
    lat: 54.525961,
    lon: 15.255119,
  },
  {
    id: "north-america",
    name: "North America",
    icon: NorthAmericaIcon,
    lat: 54.526,
    lon: -105.255119,
  },
  {
    id: "south-america",
    name: "South America",
    icon: SouthAmericaIcon,
    lat: -8.783195,
    lon: -55.491477,
  },
];

const buttonClasses =
  "h-12 pb-0 w-full rounded rounded-b-none border-b-2 border-transparent border-b-black bg-transparent text-left shadow-none px-0";

export function LocationCombobox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<SelectedPlace | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    isLoading,
    error,
    places,
    searchPlaces,
    getPlaceDetails,
    resetPlaces,
  } = usePlacesAutocomplete();

  const handleInputChange = (input: string) => {
    searchPlaces(input);
  };

  const handlePlaceSelect = async (placeId: string, description: string) => {
    try {
      const placeDetails = await getPlaceDetails(placeId, description);
      setValue(placeDetails);
      setOpen(false);
      updateSearchParams(placeDetails);
    } catch (error) {
      console.error("Failed to get place details:", error);
    }
  };

  const handleContinentSelect = (continent: (typeof DEFAULT_CONTINENTS)[0]) => {
    setValue({
      name: continent.name,
      lat: continent.lat,
      lon: continent.lon,
      continent: continent.id,
    });
    setOpen(false);
    updateSearchParams({
      name: continent.name,
      lat: continent.lat,
      lon: continent.lon,
      continent: continent.id,
    });
  };

  const updateSearchParams = (place: SelectedPlace) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    // Clear all location-related params first
    current.delete("place");
    current.delete("lat");
    current.delete("lon");
    current.delete("continent");

    if (place.continent) {
      // If it's a continent selection
      current.set("continent", place.continent);
    } else {
      // If it's a place selection
      current.set("place", encodeURIComponent(place.name));
      current.set("lat", place.lat.toString());
      current.set("lon", place.lon.toString());
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${window.location.pathname}${query}`, { scroll: false });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={buttonClasses}
          disabled={isLoading}
        >
          <span className="flex w-full items-center justify-between text-base">
            <span className="truncate">
              {value ? value.name.toUpperCase() : "LOCATION"}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder={error || "Search for a location..."}
            onValueChange={handleInputChange}
            disabled={isLoading}
          />
          <CommandList>
            <CommandEmpty>No locations found.</CommandEmpty>
            <CommandGroup>
              {places.length > 0
                ? places.map((place) => (
                    <CommandItem
                      key={place.place_id}
                      value={place.description}
                      onSelect={() =>
                        handlePlaceSelect(place.place_id, place.description)
                      }
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          value?.name === place.description
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {place.description}
                    </CommandItem>
                  ))
                : DEFAULT_CONTINENTS.map((continent) => (
                    <CommandItem
                      key={continent.id}
                      value={continent.name}
                      onSelect={() => handleContinentSelect(continent)}
                      className="flex items-center gap-2 py-3"
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          value?.continent === continent.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <continent.icon
                        size={42}
                        className="text-muted-foreground"
                      />
                      <span className="font-medium">{continent.name}</span>
                    </CommandItem>
                  ))}
            </CommandGroup>
            <CommandGroup>
              {places.length > 0 && (
                <Button size={"sm"} onClick={resetPlaces}>
                  Clear
                </Button>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
