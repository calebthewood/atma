"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { searchProperties, type CountryProperties, type PropertyWithIncludes } from "@/actions/location-actions";



import { getCountryName } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading-spinner";
import { RetreatItem } from "@/components/retreat-item";
import { Lead } from "@/components/typography";



import TabbedSearchResults from "./tabbed-search-results";


type SearchMode = "location" | "continent";

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<
    PropertyWithIncludes[] | CountryProperties[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>("location");

  const searchParams = useSearchParams();

  const handleSearch = useCallback(async () => {
    const place = searchParams.get("place");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const continent = searchParams.get("continent");

    if (!place && !continent && !lat && !lng) {
      setError("Please provide a valid location or continent to search.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (continent) {
        setSearchMode("continent");
        const result = await searchProperties({
          continent,
          includeHost: true,
          includeImages: true,
        });

        if (!result.ok) {
          throw new Error(result.message);
        }

        setSearchResults(result.data || []);
      } else if (lat && lng) {
        setSearchMode("location");
        const result = await searchProperties({
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          radiusMiles: 200,
          limit: 10,
          includeHost: true,
          includeImages: true,
        });

        if (!result.ok) {
          throw new Error(result.message);
        }

        setSearchResults(result.data || []);
      } else if (place) {
        // For place-based search, we could implement geocoding here
        // For now, we'll show an error
        setError(
          "Location search requires latitude and longitude coordinates."
        );
      }
    } catch (err) {
      console.error("Error during search:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while searching."
      );
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
    if (!results.length) return <Lead>No properties found in this area.</Lead>;

    return (
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {results.map((property, i) => (
          <div key={i + property.id} className="flex flex-col">
            <RetreatItem
              retreat={property}
              imgUrl={property.images?.[0]?.filePath}
              segment="destinations"
              className="w-[250px]"
              aspectRatio="portrait"
              width={250}
              height={330}
            />
            <div className="mt-2 text-sm text-muted-foreground">
              {property.address ||
                `${property.city}, ${getCountryName(property.country)}`}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContinentResults = () => {
    const results = searchResults as CountryProperties[];
    if (!results.length)
      return <Lead>No properties found in this continent.</Lead>;

    return <TabbedSearchResults results={results} />;
  };

  return (
    <div className="h-full px-4 py-6 md:container lg:px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Search Results
          </h2>
          <p className="text-sm text-muted-foreground">
            {searchMode === "location"
              ? "Properties within range"
              : "Search for properties around the world"}
          </p>
        </div>
      </div>
      <div className="relative mt-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <Lead className="mt-4 text-red-500">{error}</Lead>
        ) : searchResults.length === 0 ? (
          <Lead className="mt-4">No results found.</Lead>
        ) : searchMode === "location" ? (
          renderLocationResults()
        ) : (
          renderContinentResults()
        )}
      </div>
    </div>
  );
}
