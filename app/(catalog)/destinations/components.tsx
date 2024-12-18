"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CountryProperties,
  PropertyWithIncludes,
  searchProperties,
} from "@/actions/location-actions";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Lead } from "@/components/typography";
import { NewLazyRetreatItem } from "@/components/upcoming-carousel";

import TabbedSearchResults from "../search/tabbed-search-results";

export default function DestinationPage({
  destinations,
}: {
  destinations: CountryProperties[];
}) {
  const [searchResults, setSearchResults] = useState<PropertyWithIncludes[]>(
    []
  );
  const [groupedResults, setGroupedResults] =
    useState<CountryProperties[]>(destinations);
  const [searchType, setSearchType] = useState<
    "location" | "continent" | "all"
  >("all");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  const searchParams = useSearchParams();

  const handleSearch = useCallback(async () => {
    const encodedPlace = searchParams.get("place");
    const place = encodedPlace ? decodeURIComponent(encodedPlace) : "";
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const continent = searchParams.get("continent");

    setIsLoading(true);
    setError(null);

    try {
      if (continent) {
        setSearchType("continent");
        const results = await searchProperties({
          continent,
          includeHost: true,
          includeImages: true,
        });
        if (Array.isArray(results) && "country" in results[0]) {
          setGroupedResults(results as CountryProperties[]);
        }
        setHasMore(false);
      } else if (lat && lon) {
        setSearchType("location");
        const searchCriteria = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          radiusMiles: 200,
          limit: pageSize,
          includeHost: true,
          includeImages: true,
        };

        const places = await searchProperties(searchCriteria);
        if (Array.isArray(places) && !("country" in places[0])) {
          setSearchResults(places as PropertyWithIncludes[]);
        }
        setHasMore(false);
      } else {
        // No search parameters - fetch paginated properties
        setSearchType("all");
        const results = await searchProperties({
          limit: pageSize,
          // page: currentPage,
          includeHost: true,
          includeImages: true,
        });

        if (Array.isArray(results) && !("country" in results[0])) {
          const properties = results as PropertyWithIncludes[];
          setSearchResults((prev) =>
            currentPage === 1 ? properties : [...prev, ...properties]
          );
          setHasMore(properties.length === pageSize);
        }
      }
    } catch (err) {
      console.error("Error during search:", err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, currentPage]);

  useEffect(() => {
    // Reset page when search params change
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [handleSearch]);

  const renderLocationResults = () => {
    return (
      <div className="flex flex-wrap gap-8">
        {searchResults.map((property, i) => (
          <NewLazyRetreatItem
            key={`search-result-${i}`}
            id={property?.id}
            segment="destinations"
            className="h-96 w-[250px] md:w-[300px] lg:w-[400px]"
          />
        ))}
      </div>
    );
  };

  const renderAllResults = () => {
    return (
      <div className="space-y-8">
        {renderLocationResults()}
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              variant="outline"
              disabled={isLoading}
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderContinentResults = () => {
    return <TabbedSearchResults results={groupedResults} />;
  };

  return (
    <div className="h-full px-4 py-6 md:container lg:px-8">
      <div className="relative">
        {isLoading && !searchResults.length && !groupedResults.length ? (
          <LoadingSpinner />
        ) : error ? (
          <Lead className="mt-4 text-red-500">{error}</Lead>
        ) : !searchResults.length && !groupedResults.length ? (
          <Lead className="mt-4">No results found.</Lead>
        ) : searchType === "location" ? (
          renderAllResults()
        ) : (
          renderContinentResults()
        )}
        {isLoading &&
          (searchResults.length > 0 || groupedResults.length > 0) && (
            <div className="mt-4 flex justify-center">
              <LoadingSpinner />
            </div>
          )}
      </div>
    </div>
  );
}
