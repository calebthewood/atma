"use server";

import { revalidatePath } from "next/cache";
import { retreatFormSchema } from "@/schemas/retreat-schema";
import { Prisma, Retreat } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";

// ============================================================================
// Types
// ============================================================================

export type BaseRetreat = Retreat & {
  property?: { name: string; city: string | null; location: string | null };
  host?: { name: string | null };
};

export type SimpleRetreat = Prisma.RetreatGetPayload<{
  include: {
    property: {
      select: {
        name: true;
        city: true;
        country: true;
        location: true;
        images: true;
      };
    };
    host: true;
  };
}>;

export type RetreatWithRelations = Prisma.RetreatGetPayload<{
  include: {
    property: {
      select: {
        images: true;
        city: true;
        country: true;
        name: true;
      };
    };
    priceMods: true;
    host: true;
    amenities: true;
    images: true;
    retreatInstances: {
      include: {
        priceMods: true;
      };
    };
  };
}>;

export type ActionResponse<T = void> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
}>;

export type RetreatFormData = z.infer<typeof retreatFormSchema>;

export type RetreatWithPropertyGroup = {
  propertyId: string;
  propertyName: string;
  images: any[]; // Replace with proper Image type if available
  retreats: Retreat[];
};

export type RetreatWithBasicRelations = Prisma.RetreatGetPayload<{
  include: {
    property: { select: { name: true } };
    host: { select: { name: true } };
  };
}>;

export type PaginatedRetreatsResponse = {
  retreats: RetreatWithBasicRelations[];
  totalPages: number;
  currentPage: number;
};

type PriceModWithDetails = {
  id: string;
  name: string;
  desc: string;
  type: string;
  currency: string;
  value: number;
  unit: string;
  dateStart: Date | null;
  dateEnd: Date | null;
  guestMin: number | null;
  guestMax: number | null;
  roomType: string;
  createdAt: Date;
  updatedAt: Date;
  retreatInstanceId: string | null;
  programId: string | null;
  hostId: string | null;
  retreatId: string | null;
  propertyId: string | null;
  programInstanceId: string | null;
};

// ============================================================================
// Core CRUD Operations
// ============================================================================

export async function createRetreat(
  data: RetreatFormData
): ActionResponse<Retreat> {
  try {
    const { hostId, propertyId, date, ...restData } = data;

    const retreat = await prisma.retreat.create({
      data: {
        ...restData,
        date: date ? new Date(date) : null,
        property: {
          connect: { id: propertyId },
        },
        ...(hostId
          ? {
              host: {
                connect: { id: hostId },
              },
            }
          : {}),
      },
    });

    revalidatePath("/admin/retreat");
    return { success: true, data: retreat };
  } catch (error) {
    console.error("Error creating retreat:", error);
    return { success: false, error: "Failed to create retreat" };
  }
}

export async function getRetreat(
  id: string
): ActionResponse<RetreatWithRelations> {
  try {
    const retreat = await prisma.retreat.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            images: true,
            city: true,
            country: true,
            name: true,
          },
        },
        priceMods: true,
        host: true,
        amenities: true,
        images: true,
        retreatInstances: {
          include: {
            priceMods: true,
          },
        },
      },
    });

    if (!retreat) {
      return { success: false, error: "Retreat not found" };
    }

    return { success: true, data: retreat };
  } catch (error) {
    console.error("Failed to fetch retreat:", error);
    return { success: false, error: "Failed to fetch retreat" };
  }
}

export async function getSimpleRetreat(
  id: string
): ActionResponse<SimpleRetreat> {
  try {
    const retreat = await prisma.retreat.findUnique({
      where: { id, status: "published" },
      include: {
        property: {
          select: {
            images: true,
            city: true,
            country: true,
            name: true,
            location: true,
          },
        },
        host: true,
        images: true,
      },
    });

    if (!retreat) {
      return { success: false, error: "Retreat not found" };
    }

    return { success: true, data: retreat };
  } catch (error) {
    console.error("Failed to fetch retreat:", error);
    return { success: false, error: "Failed to fetch retreat" };
  }
}

export async function updateRetreat(
  id: string,
  data: Partial<RetreatFormData>
): ActionResponse<Retreat> {
  try {
    const retreat = await prisma.retreat.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/retreats");
    revalidatePath(`/admin/retreats/${id}`);
    return { success: true, data: retreat };
  } catch (error) {
    console.error("Failed to update retreat:", error);
    return { success: false, error: "Failed to update retreat" };
  }
}

export async function deleteRetreat(id: string): ActionResponse {
  try {
    await prisma.retreat.delete({
      where: { id },
    });

    revalidatePath("/admin/retreat");
    revalidatePath(`/admin/retreat/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting retreat:", error);
    return { success: false, error: "Failed to delete retreat" };
  }
}

// ============================================================================
// List & Query Operations
// ============================================================================

export async function getRetreats(): ActionResponse<BaseRetreat[]> {
  try {
    const retreats = await prisma.retreat.findMany({
      where: { status: "published" },
      include: {
        property: { select: { name: true, city: true, location: true } },
      },
    });
    return { success: true, data: retreats };
  } catch (error) {
    console.error("Error finding retreats:", error);
    return { success: false, error: "Failed to find retreats" };
  }
}

export async function getPaginatedRetreats(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
): ActionResponse<PaginatedRetreatsResponse> {
  try {
    const skip = (page - 1) * pageSize;
    const where: Prisma.RetreatWhereInput = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm } },
            { duration: { contains: searchTerm } },
            { desc: { contains: searchTerm } },
          ],
        }
      : {};

    const [retreats, totalCount] = await Promise.all([
      prisma.retreat.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
        include: {
          property: { select: { name: true } },
          host: { select: { name: true } },
        },
      }),
      prisma.retreat.count({ where }),
    ]);

    return {
      success: true,
      data: {
        retreats,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated retreats:", error);
    return { success: false, error: "Failed to fetch retreats" };
  }
}

// ============================================================================
// Property-Related Operations
// ============================================================================

export async function getRetreatsByProperty(
  propertyId: string
): ActionResponse<BaseRetreat[]> {
  try {
    const retreats = await prisma.retreat.findMany({
      where: { propertyId },
      include: { property: true },
    });
    return { success: true, data: retreats };
  } catch (error) {
    console.error("Error finding retreats:", error);
    return { success: false, error: "Failed to find retreats" };
  }
}

export async function getRetreatsGroupedByProperty(): ActionResponse<
  RetreatWithPropertyGroup[]
> {
  try {
    const propertiesWithRetreats = await prisma.property.findMany({
      include: {
        retreats: true,
        images: true,
      },
      where: {
        retreats: {
          some: {},
        },
      },
    });

    const groupedRetreats = propertiesWithRetreats.map((property) => ({
      propertyId: property.id,
      propertyName: property.name,
      images: property.images,
      retreats: property.retreats,
    }));

    return { success: true, data: groupedRetreats };
  } catch (error) {
    console.error("Error finding retreats grouped by property:", error);
    return {
      success: false,
      error: "Failed to find retreats grouped by property",
    };
  }
}

export async function getRetreatsWithNoProperty(): ActionResponse<Retreat[]> {
  try {
    const retreats = await prisma.retreat.findMany({
      where: {
        propertyId: undefined,
      },
    });
    return { success: true, data: retreats };
  } catch (error) {
    console.error("Error finding retreats with no property:", error);
    return {
      success: false,
      error: "Failed to find retreats with no property",
    };
  }
}

export async function joinRetreatAndProperty(
  retreatId: string,
  propertyId: string
): ActionResponse<Retreat> {
  try {
    const retreat = await prisma.retreat.update({
      where: { id: retreatId },
      data: {
        property: { connect: { id: propertyId } },
      },
      include: { property: true },
    });
    return { success: true, data: retreat };
  } catch (error) {
    console.error("Error joining retreat and property:", error);
    return { success: false, error: "Failed to join retreat and property" };
  }
}

// ============================================================================
// Price-Related Operations
// ============================================================================

export async function getRetreatPrices(
  id: string
): ActionResponse<PriceModWithDetails[]> {
  try {
    const prices = await prisma.priceMod.findMany({
      where: { retreatId: id },
    });
    return { success: true, data: prices };
  } catch (error) {
    console.error("Error fetching retreat prices:", error);
    return { success: false, error: "Failed to fetch retreat prices" };
  }
}

export async function getInstancePrices(
  id: string
): ActionResponse<PriceModWithDetails[]> {
  try {
    const prices = await prisma.priceMod.findMany({
      where: { retreatInstanceId: id },
    });
    return { success: true, data: prices };
  } catch (error) {
    console.error("Error fetching instance prices:", error);
    return { success: false, error: "Failed to fetch instance prices" };
  }
}
