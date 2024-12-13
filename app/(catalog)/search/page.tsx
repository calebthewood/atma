"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { searchProperties } from "@/actions/location-actions";
import { PropertiesWithImages } from "@/actions/property-actions";
import { addDays } from "date-fns";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/loading-spinner";
import { RetreatItem } from "@/components/retreat-item";
import { Lead } from "@/components/typography";

export default function Page() {
  const [searchResults, setSearchResults] = useState<PropertiesWithImages[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();

  const handleSearch = useCallback(async () => {
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
      setIsLoading(true);
      setError(null);

      try {
        const places = await searchProperties({
          latitude: searchCriteria.lat,
          longitude: searchCriteria.lon,
          radiusMiles: 200,
          limit: 10,
          includeHost: true,
          includeImages: true,
        });
        console.log("places ", places);
        if (places) {
          // @ts-ignore
          setSearchResults(places);
        }
      } catch (err) {
        console.error("Error during search:", err);
        setError("An error occurred while searching. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Cannot search without location coordinates");
      setError("Please provide a valid location to search.");
    }
  }, [searchParams]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch();
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [handleSearch]);

  return (
    <div className="h-full px-4 py-6 md:container lg:px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Search Results
          </h2>
          <p className="text-sm text-muted-foreground">
            Properties within range
          </p>
        </div>
      </div>
      <div className="relative">
        <ScrollArea>
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <Lead className="mt-4 text-red-500">{error}</Lead>
          ) : searchResults.length === 0 ? (
            <Lead className="mt-4">No results found.</Lead>
          ) : (
            <div className="flex space-x-4 pb-4">
              {searchResults.map((r, i) => (
                <div key={r.name + `${i * 3.7}`} className="flex flex-col">
                  <RetreatItem
                    retreat={r}
                    imgUrl={r.images[0]?.filePath}
                    segment="destinations"
                    className="w-[250px]"
                    aspectRatio="portrait"
                    width={250}
                    height={330}
                  />
                  <div>{r.address}</div>
                </div>
              ))}
            </div>
          )}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
