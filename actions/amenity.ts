// actions/amenity-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { Amenity } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";

import { ActionResponse } from "./shared";

/** ToC
 * Types and Schemas:
 *   - EntityType, AmenityType, AmenityData types
 *   - Validation schemas
 *
 * Core CRUD Operations:
 *   - createAmenity(data: AmenityData): Promise<ActionResponse<Amenity>>
 *   - updateAmenity(id: string, data: Partial<AmenityData>): Promise<ActionResponse<Amenity>>
 *   - deleteAmenity(id: string): Promise<ActionResponse>
 *
 * Query Operations:
 *   - getAmenitiesByType(type: AmenityType): Promise<ActionResponse<Amenity[]>>
 *   - getAmenitiesByCategory(type: AmenityType): Promise<ActionResponse<Record<string, Amenity[]>>>
 *
 * Entity Relations:
 *   - updateEntityAmenity(entityType: EntityType, entityId: string, amenityId: string, action: "connect" | "disconnect"): Promise<ActionResponse>
 *   - getEntityAmenities(entityType: EntityType, entityId: string, amenityType: AmenityType): Promise<ActionResponse<Amenity[]>>
 */

// ============================================================================
// Types and Schemas
// ============================================================================

export type EntityType = "property" | "host" | "retreat" | "program";
export type AmenityType = "activity" | "amenity";

export type AmenityData = {
  type: string;
  categoryValue?: string;
  categoryName?: string;
  name: string;
  value: string;
  custom?: boolean;
};

// Validation schemas
const amenityTypeSchema = z.enum(["activity", "amenity"]);
const entityTypeSchema = z.enum(["property", "host", "retreat", "program"]);
const actionSchema = z.enum(["connect", "disconnect"]);

// ============================================================================
// Core CRUD Operations
// ============================================================================

export async function createAmenity(
  data: AmenityData
): ActionResponse<Amenity> {
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

    return {
      ok: true,
      data: amenity,
      message: "Successfully created amenity",
    };
  } catch (error) {
    console.log("Failed to create amenity:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to create amenity",
    };
  }
}

export async function updateAmenity(
  id: string,
  data: Partial<AmenityData>
): ActionResponse<Amenity> {
  try {
    const amenity = await prisma.amenity.update({
      where: { id },
      data,
    });

    return {
      ok: true,
      data: amenity,
      message: "Successfully updated amenity",
    };
  } catch (error) {
    console.log("Failed to update amenity:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to update amenity",
    };
  }
}

export async function deleteAmenity(id: string): ActionResponse {
  try {
    await prisma.amenity.delete({
      where: { id },
    });

    return {
      ok: true,
      data: null,
      message: "Successfully deleted amenity",
    };
  } catch (error) {
    console.log("Failed to delete amenity:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to delete amenity",
    };
  }
}

// ============================================================================
// Query Operations
// ============================================================================

export async function getAmenitiesByType(
  type: AmenityType
): ActionResponse<Amenity[]> {
  try {
    const validatedType = amenityTypeSchema.parse(type);

    const amenities = await prisma.amenity.findMany({
      where: { type: validatedType },
      orderBy: [{ categoryName: "asc" }, { name: "asc" }],
    });

    return {
      ok: true,
      data: amenities,
      message: "Successfully fetched amenities",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        data: null,
        message: `Invalid amenity type: ${type}`,
      };
    }
    console.log("Failed to fetch amenities:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to fetch amenities",
    };
  }
}

export async function getAmenitiesByCategory(
  type: AmenityType
): ActionResponse<Record<string, Amenity[]>> {
  try {
    const validatedType = amenityTypeSchema.parse(type);

    const amenities = await prisma.amenity.findMany({
      where: { type: validatedType },
      orderBy: [{ categoryName: "asc" }, { name: "asc" }],
    });

    const grouped = amenities.reduce(
      (acc, amenity) => {
        const category = amenity.categoryName || "Uncategorized";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(amenity);
        return acc;
      },
      {} as Record<string, Amenity[]>
    );

    return {
      ok: true,
      data: grouped,
      message: "Successfully fetched amenities by category",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        data: null,
        message: `Invalid amenity type: ${type}`,
      };
    }
    console.log("Failed to fetch amenities by category:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to fetch amenities by category",
    };
  }
}

// ============================================================================
// Entity Relations
// ============================================================================

export async function updateEntityAmenity(
  entityType: EntityType,
  entityId: string,
  amenityId: string,
  action: "connect" | "disconnect"
): ActionResponse {
  try {
    const validatedEntityType = entityTypeSchema.parse(entityType);
    const validatedAction = actionSchema.parse(action);

    if (!entityId) throw new Error("Entity ID is required");
    if (!amenityId) throw new Error("Amenity ID is required");

    const createOrDeleteAction = async (model: any, data: any, where: any) => {
      if (validatedAction === "connect") {
        await model.create({ data });
      } else {
        await model.delete({ where });
      }
    };

    const actionMap = {
      property: {
        model: prisma.propertyAmenity,
        data: { propertyId: entityId, amenityId },
        where: { propertyId_amenityId: { propertyId: entityId, amenityId } },
      },
      host: {
        model: prisma.hostAmenity,
        data: { hostId: entityId, amenityId },
        where: { hostId_amenityId: { hostId: entityId, amenityId } },
      },
      retreat: {
        model: prisma.retreatAmenity,
        data: { retreatId: entityId, amenityId },
        where: { retreatId_amenityId: { retreatId: entityId, amenityId } },
      },
      program: {
        model: prisma.programAmenity,
        data: { programId: entityId, amenityId },
        where: { programId_amenityId: { programId: entityId, amenityId } },
      },
    };

    const actionObj = actionMap[validatedEntityType];
    await createOrDeleteAction(
      actionObj.model,
      actionObj.data,
      actionObj.where
    );

    revalidatePath(`/admin/${validatedEntityType}s/${entityId}`);
    revalidatePath(`/${validatedEntityType}s/${entityId}`);

    return {
      ok: true,
      data: null,
      message: `Successfully ${validatedAction}ed amenity`,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        data: null,
        message: `Invalid input parameters: ${error.message}`,
      };
    }
    console.log("Failed to update entity amenity:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to update entity amenity",
    };
  }
}

export async function getEntityAmenities(
  entityType: EntityType,
  entityId: string,
  amenityType: AmenityType
): ActionResponse<Amenity[]> {
  try {
    const validatedEntityType = entityTypeSchema.parse(entityType);
    const validatedAmenityType = amenityTypeSchema.parse(amenityType);

    if (!entityId) throw new Error("Entity ID is required");

    const queryMap = {
      property: { propertyAmenities: { some: { propertyId: entityId } } },
      host: { hostAmenities: { some: { hostId: entityId } } },
      retreat: { retreatAmenities: { some: { retreatId: entityId } } },
      program: { programAmenities: { some: { programId: entityId } } },
    };

    const amenities = await prisma.amenity.findMany({
      where: {
        type: validatedAmenityType,
        ...queryMap[validatedEntityType],
      },
      orderBy: [{ categoryName: "asc" }, { name: "asc" }],
    });

    return {
      ok: true,
      data: amenities,
      message: "Successfully fetched entity amenities",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        data: null,
        message: `Invalid input parameters: ${error.message}`,
      };
    }
    console.log("Failed to fetch entity amenities:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to fetch entity amenities",
    };
  }
}
