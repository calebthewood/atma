"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export type EntityType = "property" | "host" | "retreat" | "program";
export type AmenityType = "activity" | "amenity";
export type Amenity = {
  id: string;
  type: string;
  categoryValue: string | null;
  categoryName: string | null;
  name: string;
  value: string;
  custom: boolean;
};

// Validation schemas
const amenityTypeSchema = z.enum(["activity", "amenity"]);
const entityTypeSchema = z.enum(["property", "host", "retreat", "program"]);
const actionSchema = z.enum(["connect", "disconnect"]);

/**
 * CRUD Operations for base Amenity table
 */
export async function createAmenity(data: {
  type: string;
  categoryValue?: string;
  categoryName?: string;
  name: string;
  value: string;
  custom?: boolean;
}) {
  try {
    const amenity = await prisma.amenity.create({
      data: {
        type: data.type,
        categoryValue: data.categoryValue,
        categoryName: data.categoryName,
        name: data.name,
        value: data.value,
        custom: data.custom ?? false,
      },
    });
    return amenity;
  } catch (error) {
    console.error("Failed to create amenity:", error);
    throw new Error("Failed to create amenity");
  }
}

export async function updateAmenity(
  id: string,
  data: {
    type?: string;
    categoryValue?: string | null;
    categoryName?: string | null;
    name?: string;
    value?: string;
    custom?: boolean;
  }
) {
  try {
    const amenity = await prisma.amenity.update({
      where: { id },
      data,
    });
    return amenity;
  } catch (error) {
    console.error("Failed to update amenity:", error);
    throw new Error("Failed to update amenity");
  }
}

export async function deleteAmenity(id: string) {
  try {
    await prisma.amenity.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to delete amenity:", error);
    throw new Error("Failed to delete amenity");
  }
}

/**
 * Get all amenities of a specific type
 */
export async function getAmenitiesByType(type: AmenityType): Promise<
  {
    id: string;
    name: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
    categoryValue: string | null;
    categoryName: string | null;
    value: string;
    custom: boolean;
  }[]
> {
  try {
    const validatedType = amenityTypeSchema.parse(type);
    const amenities = await prisma.amenity.findMany({
      where: { type: validatedType },
      orderBy: [{ categoryName: "asc" }, { name: "asc" }],
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
 * Update entity amenities (connect or disconnect)
 */
export async function updateEntityAmenity(
  entityType: EntityType,
  entityId: string,
  amenityId: string,
  action: "connect" | "disconnect"
): Promise<void> {
  try {
    const validatedEntityType = entityTypeSchema.parse(entityType);
    const validatedAction = actionSchema.parse(action);

    if (!entityId) throw new Error("Entity ID is required");
    if (!amenityId) throw new Error("Amenity ID is required");

    // Handle each entity type explicitly
    switch (validatedEntityType) {
      case "property":
        if (validatedAction === "connect") {
          await prisma.propertyAmenity.create({
            data: {
              propertyId: entityId,
              amenityId: amenityId,
            },
          });
        } else {
          await prisma.propertyAmenity.delete({
            where: {
              propertyId_amenityId: {
                propertyId: entityId,
                amenityId: amenityId,
              },
            },
          });
        }
        break;

      case "host":
        if (validatedAction === "connect") {
          await prisma.hostAmenity.create({
            data: {
              hostId: entityId,
              amenityId: amenityId,
            },
          });
        } else {
          await prisma.hostAmenity.delete({
            where: {
              hostId_amenityId: {
                hostId: entityId,
                amenityId: amenityId,
              },
            },
          });
        }
        break;

      case "retreat":
        if (validatedAction === "connect") {
          await prisma.retreatAmenity.create({
            data: {
              retreatId: entityId,
              amenityId: amenityId,
            },
          });
        } else {
          await prisma.retreatAmenity.delete({
            where: {
              retreatId_amenityId: {
                retreatId: entityId,
                amenityId: amenityId,
              },
            },
          });
        }
        break;

      case "program":
        if (validatedAction === "connect") {
          await prisma.programAmenity.create({
            data: {
              programId: entityId,
              amenityId: amenityId,
            },
          });
        } else {
          await prisma.programAmenity.delete({
            where: {
              programId_amenityId: {
                programId: entityId,
                amenityId: amenityId,
              },
            },
          });
        }
        break;
    }

    // Revalidate the paths that might show this data
    revalidatePath(`/admin/${validatedEntityType}s/${entityId}`);
    revalidatePath(`/${validatedEntityType}s/${entityId}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input parameters: ${error.message}`);
    }
    console.error("Failed to update entity amenity:", error);
    throw new Error("Failed to update entity amenity");
  }
}

/**
 * Get amenities for a specific entity
 */
export async function getEntityAmenities(
  entityType: EntityType,
  entityId: string,
  amenityType: AmenityType
): Promise<
  {
    id: string;
    type: string;
    categoryValue: string | null;
    categoryName: string | null;
    name: string;
    value: string;
    custom: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[]
> {
  try {
    const validatedEntityType = entityTypeSchema.parse(entityType);
    const validatedAmenityType = amenityTypeSchema.parse(amenityType);

    if (!entityId) throw new Error("Entity ID is required");

    // Handle each entity type explicitly
    switch (validatedEntityType) {
      case "property":
        return await prisma.amenity.findMany({
          where: {
            type: validatedAmenityType,
            propertyAmenities: {
              some: { propertyId: entityId },
            },
          },
        });

      case "host":
        return await prisma.amenity.findMany({
          where: {
            type: validatedAmenityType,
            hostAmenities: {
              some: { hostId: entityId },
            },
          },
        });

      case "retreat":
        return await prisma.amenity.findMany({
          where: {
            type: validatedAmenityType,
            retreatAmenities: {
              some: { retreatId: entityId },
            },
          },
        });

      case "program":
        return await prisma.amenity.findMany({
          where: {
            type: validatedAmenityType,
            programAmenities: {
              some: { programId: entityId },
            },
          },
        });

      default:
        throw new Error(`Unsupported entity type: ${validatedEntityType}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input parameters: ${error.message}`);
    }
    console.error("Failed to fetch entity amenities:", error);
    throw new Error("Failed to fetch entity amenities");
  }
}

/**
 * Get amenities grouped by category, commented out for erroneous build error
 */
// export async function getAmenitiesByCategory(type: AmenityType) {
//   try {
//     const validatedType = amenityTypeSchema.parse(type);

//     const amenities = await prisma.amenity.findMany({
//       where: {
//         type: validatedType,
//       },
//       orderBy: [{ categoryName: "asc" }, { name: "asc" }],
//     });

//     const grouped = amenities.reduce(
//       (acc, amenity) => {
//         const category = amenity.categoryName || "Uncategorized";
//         if (!acc[category]) {
//           acc[category] = [];
//         }
//         acc[category].push(amenity);
//         return acc;
//       },
//       {} as Record<string, typeof amenities>
//     );

//     return grouped;
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       throw new Error(`Invalid amenity type: ${type}`);
//     }
//     console.error("Failed to fetch amenities by category:", error);
//     throw new Error("Failed to fetch amenities by category");
//   }
// }
