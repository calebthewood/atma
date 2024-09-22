"use server"

import { Property } from "@prisma/client"

import { prisma } from "@/lib/prisma"

const EARTH_RADIUS_MILES = 3959
const EARTH_RADIUS_KM = 6371

/**
 * Converts degrees to radians.
 * @param degrees - The angle in degrees.
 * @returns The angle in radians.
 */
const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

/**
 * Calculates the Haversine distance between two geographic coordinates.
 * @param lat1 - Latitude of the first point.
 * @param lon1 - Longitude of the first point.
 * @param lat2 - Latitude of the second point.
 * @param lon2 - Longitude of the second point.
 * @param radius - (Optional) Radius of the Earth, defaults to miles.
 * @returns The distance between the two points in the specified unit (miles by default).
 */
const haversineDistance = (
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null,
  radius: number = EARTH_RADIUS_MILES
): number => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
    throw new Error("Null Coordinate")
  }
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const lat1Rad = toRadians(lat1)
  const lat2Rad = toRadians(lat2)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return radius * c
}

export async function getPointsInBoundingBox(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number
) {
  const points = await prisma.property.findMany({
    where: {
      AND: [
        { latitude: { gte: minLat } },
        { latitude: { lte: maxLat } },
        { longitude: { gte: minLon } },
        { longitude: { lte: maxLon } },
      ],
    },
  })

  return points
}

/**
 * Searches for nearby places based on a given latitude and longitude.
 * @param latitude - The latitude of the user's location.
 * @param longitude - The longitude of the user's location.
 * @param radiusMiles - The search radius in miles (default is 20).
 * @returns The top 10 closest places within the given radius.
 */
export const searchNearbyPlaces = async (
  latitude: number | null,
  longitude: number | null,
  radiusMiles: number = 20
): Promise<Property[]> => {
  // Fetch all places (optimized for small datasets)
  const allPlaces = await prisma.property.findMany()

  // Calculate distances, filter by radius, and sort by proximity
  const nearbyPlaces = allPlaces
    .map((property) => ({
      ...property,
      distance: haversineDistance(
        latitude,
        longitude,
        property.latitude,
        property.longitude
      ),
    }))
    .filter((property) => property.distance <= radiusMiles)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10) // Return top 10 closest places

  return nearbyPlaces
}
