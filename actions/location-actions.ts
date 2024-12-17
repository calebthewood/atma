"use server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { haversineDistance, shortNameToContinent } from "@/lib/utils";

// import { PropertiesWithImages } from "./property-actions";

const EARTH_RADIUS_MILES = 3959;
const EARTH_RADIUS_KM = 6371;

/**
 * Converts degrees to radians.
 * @param degrees - The angle in degrees.
 * @returns The angle in radians.
 */
const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export interface SearchOptions {
  latitude?: number | null;
  longitude?: number | null;
  radiusMiles?: number;
  limit?: number;
  includeHost?: boolean;
  includeImages?: boolean;
  includePrograms?: boolean;
  includeRetreats?: boolean;
  nameContains?: string;
  continent?: string;
}

export type PropertyWithIncludes = Prisma.PropertyGetPayload<{
  include: {
    host: {
      select: {
        id: true;
        name: true;
      };
    };
    images: {
      select: {
        filePath: true;
        desc: true;
      };
    };
  };
}>;

export interface CountryProperties {
  country: string;
  properties: PropertyWithIncludes[];
}

export async function getGroupedDestinations(): Promise<CountryProperties[]> {
  const include: Prisma.PropertyInclude = {
    host: {
      select: {
        id: true,
        name: true,
      },
    },
    images: {
      select: {
        filePath: true,
        desc: true,
      },
    },
  };

  const properties = await prisma.property.findMany({ include });
  const groupedProperties = properties.reduce(
    (acc: CountryProperties[], property) => {
      if (!property.country) return acc;
      acc.push({
        country: property.country,
        properties: [property],
      });

      return acc;
    },
    []
  );
  return groupedProperties;
}

/**
 * Searches for properties based on given options, including related records.
 */
export const searchProperties = async (
  options: SearchOptions
): Promise<PropertyWithIncludes[] | CountryProperties[]> => {
  const {
    latitude,
    longitude,
    radiusMiles = 500,
    limit = 10,
    includeHost = false,
    includeImages = false,
    includePrograms = false,
    includeRetreats = false,
    nameContains,
    continent,
  } = options;

  const include: Prisma.PropertyInclude = {
    host: includeHost
      ? {
          select: {
            id: true,
            name: true,
          },
        }
      : false,
    images: includeImages
      ? {
          select: {
            filePath: true,
            desc: true,
          },
        }
      : false,
    programs: includePrograms,
    retreats: includeRetreats,
  };

  const where: Prisma.PropertyWhereInput = {
    status: "published",
  };

  if (nameContains) {
    where.name = { contains: nameContains };
  }

  // If continent is provided, handle continent-based search
  if (continent) {
    const properties = await prisma.property.findMany({
      where: {
        ...where,
        country: { not: null },
      },
      include,
    });

    // Group properties by country and filter by continent
    const groupedProperties = properties.reduce(
      (acc: CountryProperties[], property) => {
        if (!property.country) return acc;

        const propertyContinent = shortNameToContinent(property.country);

        if (propertyContinent.toLowerCase() === continent.toLowerCase()) {
          const existingCountry = acc.find(
            (cp) => cp.country === property.country
          );

          if (existingCountry) {
            existingCountry.properties.push(property);
          } else {
            acc.push({
              country: property.country,
              properties: [property],
            });
          }
        }

        return acc;
      },
      []
    );

    // Sort countries by number of properties (descending)
    return groupedProperties.sort(
      (a, b) => b.properties.length - a.properties.length
    );
  }

  // Handle location-based search
  const properties = await prisma.property.findMany({
    where,
    include,
  });

  if (latitude && longitude) {
    const nearbyProperties = properties
      .map((property) => ({
        ...property,
        distance: haversineDistance(
          latitude,
          longitude,
          property.lat ?? 0,
          property.lng ?? 0
        ),
      }))
      .filter((property) => property.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return nearbyProperties;
  }

  return properties.slice(0, limit);
};
