"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CountryProperties,
  PropertyWithIncludes,
  searchProperties,
} from "@/actions/location-actions";
import { addDays } from "date-fns";

import { getCountryName } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading-spinner";
import { RetreatItem } from "@/components/retreat-item";
import { Lead } from "@/components/typography";
import TabbedSearchResults from "./tabbed-search-results";

export default function Page() {
  const [searchResults, setSearchResults] = useState<
    PropertyWithIncludes[] | CountryProperties[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"location" | "continent">(
    "location"
  );

  const searchParams = useSearchParams();

  const handleSearch = useCallback(async () => {
    const encodedPlace = searchParams.get("place");
    const place = encodedPlace ? decodeURIComponent(encodedPlace) : "";
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const continent = searchParams.get("continent");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const guests = searchParams.get("guests");

    const today = new Date();
    const twoDaysFromNow = addDays(today, 2);

    setIsLoading(true);
    setError(null);

    try {
      if (continent) {
        // Handle continent search
        setSearchType("continent");
        const results = await searchProperties({
          continent,
          includeHost: true,
          includeImages: true,
        });
        setSearchResults(results);
      } else if (lat && lon) {
        // Handle location search
        setSearchType("location");
        const searchCriteria = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          radiusMiles: 200,
          limit: 10,
          includeHost: true,
          includeImages: true,
        };

        const places = await searchProperties(searchCriteria);
        setSearchResults(places);
      } else {
        setError("Please provide a valid location or continent to search.");
      }
    } catch (err) {
      console.error("Error during search:", err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [handleSearch]);

  const renderLocationResults = () => {
    const results = searchResults as PropertyWithIncludes[];
    return (
      <div className="flex space-x-4 pb-4">
        {results.map((property, i) => (
          <div key={property.id + `${i * 3.7}`} className="flex flex-col">
            <RetreatItem
              retreat={property}
              imgUrl={property.images?.[0]?.filePath}
              segment="destinations"
              className="w-[250px]"
              aspectRatio="portrait"
              width={250}
              height={330}
            />
            <div>{property.address}</div>
          </div>
        ))}
      </div>
    );
  };
  const renderContinentResults = () => {
    const results = searchResults as CountryProperties[];
    return <TabbedSearchResults results={results} />;
  };

  return (
    <div className="h-full px-4 py-6 md:container lg:px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Search Results
          </h2>
          <p className="text-muted-foreground text-sm">
            {searchType === "location"
              ? "Properties within range"
              : "Properties by country"}
          </p>
        </div>
      </div>
      <div className="relative">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <Lead className="mt-4 text-red-500">{error}</Lead>
        ) : searchResults.length === 0 ? (
          <Lead className="mt-4">No results found.</Lead>
        ) : searchType === "location" ? (
          renderLocationResults()
        ) : (
          renderContinentResults()
        )}
      </div>
    </div>
  );
}
