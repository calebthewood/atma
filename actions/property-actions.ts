"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { PropertyFormData } from "@/schemas/property-schema";
import { Prisma, Property } from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  ActionResponse,
  getPaginationParams,
  PaginatedResponse,
} from "./shared";

/** ToC
 * Core CRUD Operations:
 *   - createProperty(data: PropertyFormData): Promise<ActionResponse<Property>>
 *   - getProperty(id: string): Promise<ActionResponse<PropertyWithAllRelations>>
 *   - updateProperty(id: string, data: Partial<PropertyFormData>): Promise<ActionResponse<Property>>
 *   - deleteProperty(id: string): Promise<ActionResponse>
 *
 * Admin List Operations:
 *   - getAdminPaginatedProperties(page?: number, pageSize?: number, searchTerm?: string): Promise<ActionResponse<PaginatedResponse<PropertyWithBasicRelations>>>
 *
 * Public List Operations:
 *   - getPublicProperties(): Promise<ActionResponse<PropertyWithAllRelations[]>>
 *   - getPropertyAmenities(propertyId: string): Promise<ActionResponse<PropertyAmenityWithDetails[]>>
 *
 * Related Entity Operations:
 *   - getPropertyEntityIds(propertyId: string, entityType: "retreat" | "program"): Promise<ActionResponse<string[]>>
 */

// ============================================================================
// Shared Query Configurations
// ============================================================================

const COMMON_ADMIN_LIST_INCLUDE = {
  host: {
    select: {
      id: true,
      name: true,
    },
  },
  images: {
    take: 1,
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      filePath: true,
    },
  },
} as const;

// Then define the property-specific include
const PROPERTY_INCLUDE_ADMIN_LIST = {
  ...COMMON_ADMIN_LIST_INCLUDE,
  rooms: {
    select: {
      id: true,
      type: true,
      roomCount: true,
    },
  },
} satisfies Prisma.PropertyInclude;

const PROPERTY_INCLUDE_FULL = {
  host: true,
  amenities: {
    include: {
      amenity: true,
    },
  },
  images: {
    orderBy: {
      order: "asc",
    },
  },
  rooms: true,
  retreats: {
    where: {
      status: "published",
    },
    take: 10,
    orderBy: {
      date: "asc",
    },
  },
  programs: {
    where: {
      status: "published",
    },
    take: 10,
    orderBy: {
      date: "asc",
    },
  },
  priceMods: true,
} satisfies Prisma.PropertyInclude;

// ============================================================================
// Types
// ============================================================================

export type PropertyWithAllRelations = Prisma.PropertyGetPayload<{
  include: typeof PROPERTY_INCLUDE_FULL;
}>;

export type PropertyWithBasicRelations = Prisma.PropertyGetPayload<{
  include: typeof PROPERTY_INCLUDE_ADMIN_LIST;
}>;

export type PropertyAmenityWithDetails = Prisma.PropertyAmenityGetPayload<{
  include: { amenity: true };
}>;

// Helper to build property-specific search conditions
function buildPropertySearchConditions(
  searchTerm: string
): Prisma.PropertyWhereInput {
  if (!searchTerm) return {};

  return {
    OR: [
      { name: { contains: searchTerm } },
      { city: { contains: searchTerm } },
      { country: { contains: searchTerm } },
      { type: { contains: searchTerm } },
    ],
  };
}

// ============================================================================
// Core CRUD Operations
// ============================================================================

export async function createProperty(
  data: PropertyFormData
): ActionResponse<Property> {
  try {
    const { hostId, ...restData } = data;

    const createData: Prisma.PropertyCreateInput = {
      ...restData,
      lat: restData.lat ? parseFloat(restData.lat.toString()) : null,
      lng: restData.lng ? parseFloat(restData.lng.toString()) : null,
      host: {
        connect: { id: hostId || "" },
      },
    };

    const property = await prisma.property.create({
      data: createData,
    });

    revalidatePath("/admin/property");
    return {
      ok: true,
      data: property,
      message: "Successfully created property",
    };
  } catch (error) {
    console.error("Failed to create property:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to create property. Host is required.",
    };
  }
}

export async function getProperty(
  id: string
): ActionResponse<PropertyWithAllRelations> {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: PROPERTY_INCLUDE_FULL,
    });

    if (!property) {
      return {
        ok: false,
        data: null,
        message: "Property not found",
      };
    }

    return {
      ok: true,
      data: property,
      message: "Successfully fetched property",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error fetching property",
    };
  }
}

export async function updateProperty(
  id: string,
  data: Partial<PropertyFormData>
): ActionResponse<Property> {
  try {
    const { hostId, ...restData } = data;

    const updateData: Prisma.PropertyUpdateInput = {
      ...restData,
      ...(restData.lat !== undefined
        ? {
            lat: restData.lat ? parseFloat(restData.lat.toString()) : null,
          }
        : {}),
      ...(restData.lng !== undefined
        ? {
            lng: restData.lng ? parseFloat(restData.lng.toString()) : null,
          }
        : {}),
      ...(hostId !== undefined
        ? {
            host: { connect: { id: hostId } },
          }
        : {}),
    };

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/property");
    revalidatePath(`/admin/property/${id}`);
    return {
      ok: true,
      data: property,
      message: "Successfully updated property",
    };
  } catch (error) {
    console.error("Failed to update property:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to update property",
    };
  }
}

export async function deleteProperty(id: string): ActionResponse {
  try {
    await prisma.property.delete({ where: { id } });
    revalidatePath("/admin/property");
    revalidatePath(`/admin/property/${id}`);
    return {
      ok: true,
      data: null,
      message: "Successfully deleted property",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error deleting property",
    };
  }
}
// ============================================================================
// Admin List Operations
// ============================================================================

export async function getAdminPaginatedProperties(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
): Promise<ActionResponse<PaginatedResponse<PropertyWithBasicRelations>>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        ok: false,
        data: null,
        message: "Authentication required",
      };
    }

    const { skip, take } = getPaginationParams({ page, pageSize });
    const searchConditions = buildPropertySearchConditions(searchTerm);

    const whereClause = {
      ...searchConditions,
      ...(session.user.role !== "admin" && session.user.hostId
        ? { hostId: session.user.hostId }
        : {}),
    };

    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        include: PROPERTY_INCLUDE_ADMIN_LIST,
      }),
      prisma.property.count({ where: whereClause }),
    ]);

    return {
      ok: true,
      data: {
        items: properties,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
      message: "Successfully fetched paginated properties",
    };
  } catch (error) {
    console.error("Error in getAdminPaginatedProperties:", error);
    return {
      ok: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Error fetching paginated properties",
    };
  }
}

// ============================================================================
// Public List Operations
// ============================================================================

export async function getPublicProperties(): ActionResponse<
  PropertyWithAllRelations[]
> {
  try {
    const properties = await prisma.property.findMany({
      where: { status: "published" },
      include: PROPERTY_INCLUDE_FULL,
    });

    return {
      ok: true,
      data: properties,
      message: "Successfully fetched public properties",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error fetching public properties",
    };
  }
}

export async function getPropertyAmenities(
  propertyId: string
): ActionResponse<PropertyAmenityWithDetails[]> {
  try {
    const amenities = await prisma.propertyAmenity.findMany({
      where: { propertyId },
      include: { amenity: true },
      orderBy: [
        { amenity: { type: "asc" } },
        { amenity: { categoryValue: "asc" } },
        { amenity: { name: "asc" } },
      ],
    });

    return {
      ok: true,
      data: amenities,
      message: "Successfully fetched property amenities",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error fetching property amenities",
    };
  }
}

// ============================================================================
// Related Entity Operations
// ============================================================================

export async function getPropertyEntityIds(
  propertyId: string,
  entityType: "retreat" | "program"
): ActionResponse<string[]> {
  try {
    const query =
      entityType === "retreat"
        ? prisma.retreat.findMany({
            where: {
              propertyId,
              status: "published",
            },
            take: 10,
            orderBy: { date: "asc" },
            select: { id: true },
          })
        : prisma.program.findMany({
            where: {
              propertyId,
              status: "published",
            },
            take: 10,
            orderBy: { date: "asc" },
            select: { id: true },
          });

    const entities = await query;
    const ids = entities.map((e) => e.id);

    return {
      ok: true,
      data: ids,
      message: `Successfully fetched property ${entityType} IDs`,
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: `Error fetching property ${entityType} IDs`,
    };
  }
}
