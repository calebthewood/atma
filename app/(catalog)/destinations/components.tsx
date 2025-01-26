"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getGroupedDestinations,
  searchProperties,
  type CountryProperties,
  type PropertyWithIncludes,
} from "@/actions/location-actions";

import { LoadingSpinner } from "@/components/loading-spinner";
import { RetreatItem } from "@/components/retreat-item";
import { Lead } from "@/components/typography";

import TabbedSearchResults from "../search/tabbed-search-results";
import { getCountryName } from "@/lib/utils";

type SearchResults = PropertyWithIncludes[] | CountryProperties[];

export default function DestinationPage() {
  const [searchResults, setSearchResults] = useState<SearchResults>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocationSearch, setIsLocationSearch] = useState(false);

  const searchParams = useSearchParams();

  const handleSearch = useCallback(async () => {
    const place = searchParams.get("place");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const continent = searchParams.get("continent");

    setIsLoading(true);
    setError(null);

    try {
      // If no search params, show all destinations
      if (!place && !continent && !lat && !lng) {
        const response = await getGroupedDestinations();
        if (!response.ok || !response.data) {
          throw new Error(response.message || "Failed to fetch destinations");
        }
        setIsLocationSearch(false);
        setSearchResults(response.data);
        return;
      }

      // Handle location-based search
      if (lat && lng) {
        setIsLocationSearch(true);
        const response = await searchProperties({
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          radiusMiles: 200,
          limit: 20,
          includeHost: true,
          includeImages: true,
        });

        if (!response.ok || !response.data) {
          throw new Error(response.message || "Failed to fetch properties");
        }

        if (Array.isArray(response.data)) {
          setSearchResults(response.data);
        }
      } else if (continent) {
        // Handle continent-based search
        setIsLocationSearch(false);
        const response = await searchProperties({
          continent,
          includeHost: true,
          includeImages: true,
        });

        if (!response.ok || !response.data) {
          throw new Error(response.message || "Failed to fetch properties");
        }

        if (Array.isArray(response.data)) {
          setSearchResults(response.data);
        }
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
              {`${property.city}, ${getCountryName(property.country)}`}
            </div>
            {/* {"distance" in property && (
              <div className="text-xs text-muted-foreground">
                {Math.round(property?.distance)} miles away
              </div>
            )} */}
          </div>
        ))}
      </div>
    );
  };

  const renderContinentResults = () => {
    const results = searchResults as CountryProperties[];
    if (!results.length) return <Lead>No properties found.</Lead>;

    return <TabbedSearchResults results={results} />;
  };

  return (
    <div className="h-full px-4 py-6 md:container lg:px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Destinations
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLocationSearch
              ? "Properties near your selected location"
              : "Properties by country"}
          </p>
        </div>
      </div>
      <div className="relative mt-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <Lead className="mt-4 text-red-500">{error}</Lead>
        ) : searchResults.length === 0 ? (
          <Lead className="mt-4">No destinations found.</Lead>
        ) : isLocationSearch ? (
          renderLocationResults()
        ) : (
          renderContinentResults()
        )}
      </div>
    </div>
  );
}
