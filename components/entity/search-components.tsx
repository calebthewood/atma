"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchResults } from "@/actions/search-actions";

import { getCountryName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Lead } from "@/components/typography";
import { NewLazyRetreatItem } from "@/components/upcoming-carousel";

export interface SearchOptions {
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  limit?: number;
  includeProperty?: boolean;
  includeImages?: boolean;
  category?: string;
  continent?: string;
  page?: number;
  pageSize?: number;
}

export interface EntityWithLocation {
  id: string;
  name: string | null;
  category: string;
  status: string;
  property: {
    id: string;
    name: string | null;
    city: string | null;
    country: string | null;
    lat: number | null;
    lng: number | null;
  } | null;
  images: Array<{
    filePath: string;
    desc: string;
  }>;
}

export interface PropertyGroup {
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  items: EntityWithLocation[];
}

export interface CountryGroup {
  country: string;
  items: EntityWithLocation[];
}

export interface SearchResultsPageProps {
  segment: "programs" | "retreats";
  searchFunction: (options: SearchOptions) => Promise<SearchResults>;
  entityLabel: {
    singular: string;
    plural: string;
  };
}

export interface SearchResult {
  ok: true;
  data: EntityWithLocation[] | PropertyGroup[] | CountryGroup[];
  type: "location" | "continent" | "all";
}
const isCountryGroup = (group: unknown): group is CountryGroup => {
  return (
    typeof group === "object" &&
    group !== null &&
    "country" in group &&
    "items" in group &&
    Array.isArray((group as CountryGroup).items)
  );
};

export default function SearchResultsPage({
  segment,
  searchFunction,
  entityLabel,
}: SearchResultsPageProps) {
  type SearchResults = EntityWithLocation[] | PropertyGroup[] | CountryGroup[];

  const [results, setResults] = useState<SearchResults>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<
    "location" | "continent" | "all"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  const searchParams = useSearchParams();

  const handleSearch = useCallback(async () => {
    let searchCriteria: SearchOptions = {
      includeProperty: true,
      includeImages: true,
    };
    const place = searchParams.get("place");
    const purpose = searchParams.get("purpose");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const continent = searchParams.get("continent");

    setIsLoading(true);
    setError(null);

    try {
      // Build search criteria
      if (continent || lat || lng || purpose) {
        if (continent) {
          setSearchType("continent");
          searchCriteria.continent = continent;
        } else if (lat && lng) {
          setSearchType("location");
          searchCriteria = {
            ...searchCriteria,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            radiusMiles: 200,
          };
        }

        if (purpose) {
          searchCriteria.category = purpose;
        }
      } else {
        setSearchType("all");
        searchCriteria = {
          ...searchCriteria,
          page: currentPage,
          pageSize,
        };
      }

      const response = await searchFunction(searchCriteria);

      // if (!response.ok) {
      //   throw new Error(response.error);
      // }

      // Type guards for response data
      const isEntityArray = (data: any[]): data is EntityWithLocation[] => {
        return data.every((item) => "property" in item);
      };

      const isCountryGroupArray = (data: any[]): data is CountryGroup[] => {
        return data.every((item) => "country" in item && "items" in item);
      };

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response data format");
      }

      if (response.type === "continent") {
        if (!isCountryGroupArray(response.data)) {
          throw new Error("Invalid country group format");
        }
        setResults(response.data);
        setHasMore(false);
      } else if (response.type === "location") {
        if (!isEntityArray(response.data)) {
          throw new Error("Invalid entity format");
        }

        // Group by property
        const grouped = response.data.reduce<PropertyGroup[]>((acc, entity) => {
          if (!entity.property) return acc;

          const existingGroup = acc.find(
            (g) => g.propertyId === entity.property!?.id
          );
          const propertyLocation = [
            entity.property.city,
            entity.property.country,
          ]
            .filter(Boolean)
            .join(", ");

          if (existingGroup) {
            existingGroup.items.push(entity);
          } else {
            acc.push({
              propertyId: entity.property?.id,
              propertyName: entity.property.name || "Unnamed Property",
              propertyLocation,
              items: [entity],
            });
          }

          return acc;
        }, []);

        setResults(grouped);
        setHasMore(false);
      } else {
        // Handle paginated results
        if (!isEntityArray(response.data)) {
          throw new Error("Invalid entity format");
        }

        const newResults = response.data;
        if (currentPage === 1) {
          setResults(newResults);
        } else {
          setResults((prev) => {
            if (!isEntityArray(prev)) return newResults;
            return [...prev, ...newResults];
          });
        }
        setHasMore(newResults.length === pageSize);
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
  }, [searchParams, currentPage, searchFunction]);
  useEffect(() => {
    handleSearch();
  }, [searchParams, currentPage]);

  const EntityList = ({ items }: { items: EntityWithLocation[] }) => (
    <div className="grid w-full grid-cols-1 justify-items-center gap-10 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <NewLazyRetreatItem
          key={item?.id}
          id={item?.id}
          segment={segment}
          className="size-[250px] md:size-[300px] lg:size-[330px] xl:size-[380px]"
        />
      ))}
    </div>
  );

  const renderLocationResults = () => {
    const propertyGroups = results as PropertyGroup[];
    return (
      <div className="flex flex-wrap gap-8">
        {propertyGroups.map((group) => (
          <div key={group.propertyId} className="flex flex-col rounded">
            <h3 className="mb-4 text-xl font-semibold">
              {group.propertyName}
              <span className="ml-2 text-sm font-normal">
                ({group.items.length}{" "}
                {group.items.length === 1
                  ? entityLabel.singular
                  : entityLabel.plural}
                )
              </span>
            </h3>
            <EntityList items={group.items} />
          </div>
        ))}
      </div>
    );
  };

  const renderContinentResults = () => {
    if (!Array.isArray(results)) {
      return null;
    }

    // Check if results are in the correct format
    if (!results.every(isCountryGroup)) {
      console.error("Invalid results format for continent view");
      return null;
    }

    const countryGroups = results as CountryGroup[];

    return (
      <div className="flex flex-wrap gap-8">
        {countryGroups.map((group) => (
          <div key={group.country} className="flex flex-col rounded">
            <h3 className="mb-4 text-xl font-semibold">
              {getCountryName(group.country)}
              <span className="ml-2 text-sm font-normal">
                ({group.items.length}{" "}
                {group.items.length === 1
                  ? entityLabel.singular
                  : entityLabel.plural}
                )
              </span>
            </h3>
            <EntityList items={group.items} />
          </div>
        ))}
      </div>
    );
  };

  const renderAllResults = () => {
    const entities = results as EntityWithLocation[];
    return (
      <>
        <EntityList items={entities} />
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
      </>
    );
  };

  return (
    <div className="h-full px-4 py-6 md:container lg:px-8">
      {isLoading && results.length === 0 ? (
        <LoadingSpinner />
      ) : error ? (
        <Lead className="mt-4 text-red-500">{error}</Lead>
      ) : results.length === 0 ? (
        <Lead className="mt-4">
          No {entityLabel.plural} found matching your criteria.
        </Lead>
      ) : searchType === "location" ? (
        renderLocationResults()
      ) : searchType === "continent" ? (
        renderContinentResults()
      ) : (
        renderAllResults()
      )}
      {isLoading && results.length > 0 && (
        <div className="mt-4 flex justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
