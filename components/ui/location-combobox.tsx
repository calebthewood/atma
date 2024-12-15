"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader } from "@googlemaps/js-api-loader";
import { Check, ChevronsUpDown } from "lucide-react";



import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";



import { AsiaIcon, EuropeIcon, NorthAmericaIcon, SouthAmericaIcon } from "../geography/lo-res";


interface Place {
  description: string;
  place_id: string;
}

interface SelectedPlace {
  name: string;
  lat: number;
  lon: number;
}

const buttonClasses =
  "h-12 pb-0 w-full rounded rounded-b-none border-b-2 border-transparent border-b-black bg-transparent text-left shadow-none px-0";

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

  // Modify the handleInputChange function
  const handleInputChange = (input: string) => {
    if (!input.trim()) {
      setPlaces([]); // Clear places when input is empty
      return;
    }

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

  const resetPlaces = () => setPlaces([]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={buttonClasses}
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
            placeholder="Search for a location..."
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>No locations found.</CommandEmpty>
            <CommandGroup>
              {places.length > 0
                ? // Show search results when available
                  places.map((place) => (
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
                : // Updated continent items with icons
                  DEFAULT_CONTINENTS.map((continent) => (
                    <CommandItem
                      key={continent.id}
                      value={continent.name}
                      onSelect={() => {
                        setValue({
                          name: continent.name,
                          lat: continent.lat,
                          lon: continent.lon,
                        });
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 py-3"
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          value?.name === continent.name
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
            {places.length > 0 && (
              <CommandGroup>
                <Button onClick={resetPlaces} variant={"ghost"}>
                  Clear
                </Button>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
