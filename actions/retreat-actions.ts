"use server";

import { revalidatePath } from "next/cache";
import { Prisma, Retreat } from "@prisma/client";

import prisma from "@/lib/prisma";

// Base type for shared properties
type RetreatBaseInput = {
  name: string | null;
  desc: string | null;
  duration: string | null;
  date: string | null;
  priceList: string | null;
  minGuests: number | null;
  maxGuests: number | null;
  coverImg?: string | null;
  sourceUrl?: string | null;
  hostId: string | null;
  propertyId: string;
  bookingType: "Flexible" | "Fixed" | "Open" | null;
};

// Type for creating a new retreat - requires certain fields
export type CreateRetreatInput = {
  name: string;
  desc: string;
  duration: string;
  date: string;
  priceList: string;
  minGuests: number;
  maxGuests: number;
  propertyId: string;
  bookingType: "Flexible" | "Fixed" | "Open";
  hostId: string | null;
  coverImg?: string | null;
  sourceUrl?: string | null;
};

// Type for updating a retreat - all fields optional
export type UpdateRetreatInput = Partial<RetreatBaseInput>;

export async function createRetreat(data: CreateRetreatInput) {
  try {
    const retreat = await prisma.retreat.create({
      data: {
        bookingType: data.bookingType,
        name: data.name,
        desc: data.desc,
        duration: data.duration,
        date: data.date ? new Date(data.date) : null,
        priceList: data.priceList,
        minGuests: data.minGuests,
        maxGuests: data.maxGuests,
        coverImg: data.coverImg || null,
        sourceUrl: data.sourceUrl || null,
        ...(data.hostId
          ? {
              host: { connect: { id: data.hostId } },
            }
          : {}),
        property: { connect: { id: data.propertyId } },
      },
    });

    revalidatePath("/admin/retreats");
    return retreat;
  } catch (error) {
    console.error("Error creating retreat:", error);
    throw new Error("Failed to create retreat");
  }
}

export async function getRetreatIds() {
  const properties = await prisma.retreat.findMany({
    where: {
      status: "published",
    },
    select: {
      id: true,
    },
  });
  return properties;
}

export async function updateRetreat(id: string, data: UpdateRetreatInput) {
  try {
    const updateData: any = { ...data };

    // Handle date conversion if present
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    // Handle relations separately
    if (data.hostId !== undefined) {
      updateData.host = data.hostId
        ? { connect: { id: data.hostId } }
        : { disconnect: true };
      delete updateData.hostId;
    }

    if (data.propertyId) {
      updateData.property = { connect: { id: data.propertyId } };
      delete updateData.propertyId;
    }

    const retreat = await prisma.retreat.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/retreats");
    revalidatePath(`/admin/retreats/${id}`);
    return retreat;
  } catch (error) {
    console.error("Error updating retreat:", error);
    throw new Error("Failed to update retreat");
  }
}

export type RetreatWithoutNulls = {
  [K in keyof Retreat]: Retreat[K] extends null ? undefined : Retreat[K];
};

export async function getRetreatById(
  id: string
): Promise<RetreatWithoutNulls | null> {
  try {
    const retreat = await prisma.retreat.findUnique({
      where: { id },
      include: {
        amenities: true,
        host: true,
        property: true,
      },
    });

    if (!retreat) {
      return null;
    }

    // Replace null values with undefined
    const retreatWithoutNulls = Object.fromEntries(
      Object.entries(retreat).map(([key, value]) => [
        key,
        value === null ? undefined : value,
      ])
    ) as RetreatWithoutNulls;

    return retreatWithoutNulls;
  } catch (error) {
    console.error("Error fetching retreat:", error);
    throw new Error("Failed to fetch retreat");
  }
}

export type RetreatItems = Prisma.RetreatGetPayload<{
  include: {
    host: {
      select: {
        name: true;
        id: true;
      };
    };
    property: {
      select: {
        id: true;
        name: true;
        city: true;
        images: true;
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

export async function getRetreats() {
  try {
    const retreats = await prisma.retreat.findMany({
      include: {
        host: {
          select: {
            name: true,
            id: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            city: true,
            images: true,
          },
        },
        images: true,
      },
    });
    return retreats;
  } catch (error) {
    console.error("Error fetching retreats:", error);
    throw new Error("Failed to fetch retreats");
  }
}

export async function getPaginatedRetreats(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
) {
  const skip = (page - 1) * pageSize;

  try {
    const where: Prisma.RetreatWhereInput = {
      OR: [
        { name: { contains: searchTerm } },
        { bookingType: { contains: searchTerm } },
      ],
    };

    // Fetch retreats with pagination and search
    const retreats = await prisma.retreat.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
      include: {
        property: {
          select: {
            name: true,
          },
        },
        host: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalRetreats = await prisma.retreat.count({ where });

    const totalPages = Math.ceil(totalRetreats / pageSize);

    return {
      retreats: retreats.map((retreat) => ({
        ...retreat,
        propertyName: retreat.property.name,
        hostName: retreat.host?.name ?? null,
      })),
      totalPages,
      totalRetreats,
    };
  } catch (error) {
    console.error("Error fetching paginated retreats:", error);
    throw new Error("Failed to fetch retreats");
  }
}

export type RetreatWithPrice = Prisma.RetreatGetPayload<{
  include: {
    priceMods: true;
    retreatInstances: {
      include: {
        priceMods: true;
      };
    };
    images: true;
  };
}>;

export async function getRetreatWithPrice(retreatId: string) {
  try {
    const retreat = await prisma.retreat.findUnique({
      where: {
        id: retreatId,
      },
      include: {
        priceMods: true,
        retreatInstances: {
          include: {
            priceMods: true,
          },
        },
        images: true,
      },
    });

    if (!retreat) {
      throw new Error("Retreat not found");
    }

    return retreat;
  } catch (error) {
    console.error(`Error fetching retreat with id ${retreatId}:`, error);
    throw new Error(`Failed to fetch retreat with id ${retreatId}`);
  }
}

export async function deleteRetreat(id: string) {
  try {
    const retreat = await prisma.retreat.delete({
      where: { id },
    });
    revalidatePath("/admin/properties");
    revalidatePath(`/admin/properties/${id}`);
    return retreat;
  } catch (error) {
    console.error(`Error deleting retreat with id ${id}:`, error);
    throw new Error(`Failed to delete retreat with id ${id}`);
  }
}
export type RetreatWithRelations = Prisma.RetreatGetPayload<{
  include: {
    property: true;
    host: true;
    amenities: true;
    images: true;
    retreatInstances: true;
  };
}>;

type GetRetreatSuccess = {
  success: true;
  retreat: RetreatWithRelations;
};

type GetRetreatError = {
  success: false;
  error: string;
};

export type GetRetreatResponse = GetRetreatSuccess | GetRetreatError;

export async function getRetreat(
  id: string,
  publishedOnly: boolean = true
): Promise<GetRetreatResponse> {
  try {
    const retreat = await prisma.retreat.findUnique({
      where: {
        id,
        ...(publishedOnly && { status: "published" }),
      },
      include: {
        property: true,
        host: true,
        amenities: true,
        images: {
          orderBy: {
            createdAt: "asc",
          },
        },
        retreatInstances: {
          orderBy: {
            startDate: "asc",
          },
        },
      },
    });

    if (!retreat) {
      return {
        success: false,
        error: "Retreat not found",
      };
    }

    return {
      success: true,
      retreat,
    };
  } catch (error) {
    console.error("Error fetching retreat:", error);
    return {
      success: false,
      error: "Failed to fetch retreat",
    };
  }
}

export async function getRetreatPrices(id: string) {
  try {
    const prices = await prisma.priceMod.findMany({
      where: { retreatId: id },
    });

    return {
      success: true,
      prices, // Return empty array if no prices found - this is a valid state
    };
  } catch (error) {
    console.error("Error fetching prices:", error);
    return {
      success: false,
      error: "Failed to fetch prices",
    };
  }
}

export async function getInstancePrices(id: string) {
  try {
    const prices = await prisma.priceMod.findMany({
      where: { retreatInstanceId: id },
    });

    if (prices === null) {
      return {
        success: false,
        error: "prices not found",
      };
    }

    return {
      success: true,
      prices,
    };
  } catch (error) {
    console.error("Error fetching prices:", error);
    return {
      success: false,
      error: "Failed to fetch prices",
    };
  }
}
