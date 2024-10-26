"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export type EntityType = "property" | "host" | "retreat" | "program";
export type AmenityType = "activity" | "facility";
export type Amenity = {
  id: string;
  type: string;
  categoryValue: string | null;
  categoryName: string | null;
  name: string | null;
  value: string | null;
};

// Validation schemas
const amenityTypeSchema = z.enum(["activity", "facility"]);
const entityTypeSchema = z.enum(["property", "host", "retreat", "program"]);
const actionSchema = z.enum(["connect", "disconnect"]);

/**
 * Get all amenities of a specific type
 */
export async function getAmenitiesByType(type: AmenityType) {
  try {
    // Validate input
    const validatedType = amenityTypeSchema.parse(type);

    const amenities = await prisma.amenity.findMany({
      where: {
        type: validatedType,
      },
      select: {
        id: true,
        type: true,
        categoryValue: true,
        categoryName: true,
        name: true,
        value: true,
      },
    });

    return amenities;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid amenity type: ${type}`);
    }
    console.error("Failed to fetch amenities:", error);
    throw new Error("Failed to fetch amenities");
  }
}

/**
 * Get amenities for a specific entity
 */
export async function getEntityAmenities(
  entityType: EntityType,
  entityId: string,
  amenityType: AmenityType
) {
  try {
    // Validate inputs
    const validatedEntityType = entityTypeSchema.parse(entityType);
    const validatedAmenityType = amenityTypeSchema.parse(amenityType);

    // Ensure entityId exists
    if (!entityId) throw new Error("Entity ID is required");

    const amenities = await prisma.amenity.findMany({
      where: {
        type: validatedAmenityType,
        OR: [
          {
            propertyId:
              validatedEntityType === "property" ? entityId : undefined,
          },
          { hostId: validatedEntityType === "host" ? entityId : undefined },
          {
            retreatId: validatedEntityType === "retreat" ? entityId : undefined,
          },
          {
            programId: validatedEntityType === "program" ? entityId : undefined,
          },
        ],
      },
      select: {
        id: true,
        type: true,
        categoryValue: true,
        categoryName: true,
        name: true,
        value: true,
      },
    });

    return amenities;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input parameters: ${error.message}`);
    }
    console.error("Failed to fetch entity amenities:", error);
    throw new Error("Failed to fetch entity amenities");
  }
}

/**
 * Update entity amenities (connect or disconnect)
 */
export async function updateEntityAmenity(
  entityType: EntityType,
  entityId: string,
  amenityId: string,
  action: "connect" | "disconnect"
) {
  try {
    // Validate inputs
    const validatedEntityType = entityTypeSchema.parse(entityType);
    const validatedAction = actionSchema.parse(action);

    // Ensure required IDs exist
    if (!entityId) throw new Error("Entity ID is required");
    if (!amenityId) throw new Error("Amenity ID is required");

    // Create the update data based on the entity type
    const updateData = {
      [validatedEntityType]: {
        [validatedAction]: {
          id: entityId,
        },
      },
    };

    // Update the amenity
    const updatedAmenity = await prisma.amenity.update({
      where: {
        id: amenityId,
      },
      data: updateData,
    });

    // Revalidate the paths that might show this data
    revalidatePath(`/admin/${validatedEntityType}s/${entityId}`);
    revalidatePath(`/${validatedEntityType}s/${entityId}`);

    return updatedAmenity;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input parameters: ${error.message}`);
    }
    console.error("Failed to update amenity:", error);
    throw new Error("Failed to update entity amenity");
  }
}

/**
 * Create a new amenity
 */
export async function createAmenity(data: {
  type: string;
  categoryValue: string;
  categoryName: string;
  name: string;
  value: string;
}) {
  try {
    const amenity = await prisma.amenity.create({
      data: {
        type: data.type,
        categoryValue: data.categoryValue,
        categoryName: data.categoryName,
        name: data.name,
        value: data.value,
      },
    });

    return amenity;
  } catch (error) {
    console.error("Failed to create amenity:", error);
    throw new Error("Failed to create amenity");
  }
}

/**
 * Get amenities grouped by category
 */
export async function getAmenitiesByCategory(type: AmenityType) {
  try {
    const validatedType = amenityTypeSchema.parse(type);

    const amenities = await prisma.amenity.findMany({
      where: {
        type: validatedType,
      },
      orderBy: [{ categoryName: "asc" }, { name: "asc" }],
    });

    // Group amenities by category
    const grouped = amenities.reduce(
      (acc, amenity) => {
        const category = amenity.categoryName || "Uncategorized";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(amenity);
        return acc;
      },
      {} as Record<string, typeof amenities>
    );

    return grouped;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid amenity type: ${type}`);
    }
    console.error("Failed to fetch amenities by category:", error);
    throw new Error("Failed to fetch amenities by category");
  }
}
