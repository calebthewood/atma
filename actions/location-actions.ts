"use server";

import { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// import { PropertiesWithImages } from "./property-actions";

const EARTH_RADIUS_MILES = 3959;
const EARTH_RADIUS_KM = 6371;

/**
 * Converts degrees to radians.
 * @param degrees - The angle in degrees.
 * @returns The angle in radians.
 */
const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

type SearchOptions = {
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  limit?: number;
  includeHost?: boolean;
  includeImages?: boolean;
  includePrograms?: boolean;
  includeRetreats?: boolean;
  // Add more filter options as needed
  nameContains?: string;
};

/**
 * Searches for properties based on given options, including related records.
 *
 * @param options - Search options including location, radius, and what to include
 * @returns Properties matching the search criteria with included related records
 */
export const searchProperties = async (options: SearchOptions) => {
  const {
    latitude,
    longitude,
    radiusMiles = 20,
    limit = 10,
    includeHost = false,
    includeImages = false,
    includePrograms = false,
    includeRetreats = false,
    nameContains,
  } = options;

  const include: Prisma.PropertyInclude = {};

  if (includeHost) {
    include.host = { select: { name: true, id: true } };
  }

  if (includeImages) {
    include.images = { select: { filePath: true, desc: true } };
  }

  if (includePrograms) {
    include.programs = true;
  }

  if (includeRetreats) {
    include.retreats = true;
  }

  const where: Prisma.PropertyWhereInput = {};

  if (nameContains) {
    where.name = { contains: nameContains };
  }

  // Fetch properties
  const properties = await prisma.property.findMany({
    where,
    include,
  });

  // If latitude and longitude are provided, filter by distance
  if (latitude !== undefined && longitude !== undefined) {
    const nearbyProperties = properties
      .map((property) => ({
        ...property,
        distance: haversineDistance(
          latitude,
          longitude,
          property.lat,
          property.lng
        ),
      }))
      .filter((property) => property.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return nearbyProperties;
  }

  // If no location filtering, just return the first 'limit' properties
  return properties.slice(0, limit);
};

// Haversine distance calculation function
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number | null,
  lon2: number | null
): number {
  if (lat2 === null || lon2 === null) return Infinity;

  const R = 3959; // Earth radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
