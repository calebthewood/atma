"use server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { haversineDistance, shortNameToContinent } from "@/lib/utils";

type ProgramWithIncludes = Prisma.ProgramGetPayload<{
  include: { property: true; images: true };
}>;

type RetreatWithIncludes = Prisma.RetreatGetPayload<{
  include: { property: true; images: true };
}>;

type EntityWithIncludes = ProgramWithIncludes | RetreatWithIncludes;

interface CountryGroup {
  country: string;
  items: EntityWithIncludes[];
}

interface PropertyGroup {
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  items: EntityWithIncludes[];
}

interface SearchOptions {
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  page?: number;
  pageSize?: number;
  category?: string;
  continent?: string;
}

export type SearchResults =
  | {
      ok: true;
      type: "location" | "continent" | "all" | "na";
      data: EntityWithIncludes[] | PropertyGroup[] | CountryGroup[];
    }
  | {
      ok: false;
      error: string;
      type: "na";
      data: [];
    };

// Database query functions
async function queryPrograms(options: SearchOptions) {
  return prisma.program.findMany({
    where: {
      status: "published",
      ...(options.category ? { category: options.category } : {}),
    },
    include: {
      property: true,
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

async function queryRetreats(options: SearchOptions) {
  return prisma.retreat.findMany({
    where: {
      status: "published",
      ...(options.category ? { category: options.category } : {}),
    },
    include: {
      property: true,
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

// Shared filtering and grouping functions
function groupByCountry(
  items: EntityWithIncludes[],
  continent: string
): CountryGroup[] {
  const groupedItems = items.reduce((acc: CountryGroup[], item) => {
    if (!item.property?.country) return acc;

    const propertyContinent = shortNameToContinent(item.property.country);
    if (propertyContinent.toLowerCase() !== continent.toLowerCase()) return acc;

    const existingGroup = acc.find((g) => g.country === item.property!.country);
    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      acc.push({ country: item.property.country, items: [item] });
    }
    return acc;
  }, []);

  return groupedItems.sort((a, b) => b.items.length - a.items.length);
}

function groupByProperty(
  items: EntityWithIncludes[],
  latitude: number,
  longitude: number,
  radiusMiles: number
): PropertyGroup[] {
  const itemsWithDistance = items
    .filter((item) => item.property?.lat && item.property?.lng)
    .map((item) => ({
      ...item,
      distance: haversineDistance(
        latitude,
        longitude,
        item.property.lat!,
        item.property.lng!
      ),
    }))
    .filter((item) => item.distance <= radiusMiles)
    .sort((a, b) => a.distance - b.distance);

  return itemsWithDistance.reduce((acc: PropertyGroup[], item) => {
    if (!item.property) return acc;

    const existingGroup = acc.find((g) => g.propertyId === item.property!?.id);
    const propertyLocation = [item.property.city, item.property.country]
      .filter(Boolean)
      .join(", ");

    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      acc.push({
        propertyId: item.property?.id,
        propertyName: item.property?.name || "Unnamed Property",
        propertyLocation,
        items: [item],
      });
    }
    return acc;
  }, []);
}

function paginateItems(
  items: EntityWithIncludes[],
  page: number,
  pageSize: number
): EntityWithIncludes[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

// Main search functions
async function executeSearch(
  queryFn: (options: SearchOptions) => Promise<EntityWithIncludes[]>,
  options: SearchOptions,
  modelName: string
): Promise<SearchResults> {
  try {
    const items = await queryFn(options);

    if (options.continent) {
      return {
        ok: true,
        type: "continent",
        data: groupByCountry(items, options.continent),
      };
    }

    if (options.latitude && options.longitude) {
      return {
        ok: true,
        type: "location",
        data: groupByProperty(
          items,
          options.latitude,
          options.longitude,
          options.radiusMiles || 200
        ),
      };
    }

    return {
      ok: true,
      type: "all",
      data: paginateItems(items, options.page || 1, options.pageSize || 10),
    };
  } catch (error) {
    console.error(`Error searching ${modelName}:`, error);
    return {
      ok: false,
      error: `Failed to search ${modelName}`,
      type: "na",
      data: [],
    };
  }
}

export async function searchPrograms(options: SearchOptions) {
  return await executeSearch(queryPrograms, options, "programs");
}

export async function searchRetreats(options: SearchOptions) {
  return await executeSearch(queryRetreats, options, "retreats");
}
