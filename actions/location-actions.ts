"use server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { haversineDistance, shortNameToContinent } from "@/lib/utils";

import { ActionResponse } from "./shared";

// Types
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

export async function getGroupedDestinations(): ActionResponse<
  CountryProperties[]
> {
  try {
    const include: Prisma.PropertyInclude = {
      host: {
        select: {
          id: true,
          name: true,
        },
      },
      images: {
        orderBy: { order: "asc" },
        select: {
          filePath: true,
          desc: true,
        },
      },
    };

    const properties = await prisma.property.findMany({
      where: {
        status: "published",
      },
      include,
    });
    const groupedProperties = properties.reduce(
      (acc: CountryProperties[], property) => {
        if (!property.country) return acc;

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

        return acc;
      },
      []
    );

    return {
      ok: true,
      data: groupedProperties,
      message: "Successfully fetched grouped destinations",
    };
  } catch (error) {
    console.error("Error in getGroupedDestinations:", error);
    return {
      ok: false,
      data: null,
      message: "Error fetching grouped destinations",
    };
  }
}

export async function searchProperties(
  options: SearchOptions
): Promise<ActionResponse<PropertyWithIncludes[] | CountryProperties[]>> {
  try {
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

    // Handle continent-based search
    if (continent) {
      const properties = await prisma.property.findMany({
        where: {
          ...where,
          country: { not: null },
        },
        include,
      });

      const groupedProperties = properties
        .reduce((acc: CountryProperties[], property) => {
          if (!property.country) return acc;

          const propertyContinent = shortNameToContinent(property.country);

          if (propertyContinent === continent.toLowerCase()) {
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
        }, [])
        .sort((a, b) => b.properties.length - a.properties.length);

      return {
        ok: true,
        data: groupedProperties,
        message: "Successfully fetched properties by continent",
      };
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

      return {
        ok: true,
        data: nearbyProperties,
        message: "Successfully fetched nearby properties",
      };
    }

    return {
      ok: true,
      data: properties.slice(0, limit),
      message: "Successfully fetched properties",
    };
  } catch (error) {
    console.error("Error in searchProperties:", error);
    return {
      ok: false,
      data: null,
      message: "Error searching properties",
    };
  }
}
