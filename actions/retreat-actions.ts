"use server";

import { revalidatePath } from "next/cache";
import { Prisma, Retreat } from "@prisma/client";

import prisma from "@/lib/prisma";

type RetreatInput = {
  bookingType: "Flexible" | "Fixed" | "Open";
  name: string;
  desc: string;
  duration: string;
  date: string;
  priceList: string;
  minGuests: number;
  maxGuests: number;
  coverImg?: string;
  sourceUrl?: string;
  hostId: string;
  propertyId: string;
};

export async function createRetreat(data: RetreatInput) {
  try {
    const retreat = await prisma.retreat.create({
      data: {
        bookingType: data.bookingType,
        name: data.name,
        desc: data.desc,
        duration: data.duration,
        date: new Date(data.date),
        priceList: data.priceList,
        minGuests: data.minGuests,
        maxGuests: data.maxGuests,
        coverImg: data.coverImg,
        sourceUrl: data.sourceUrl,
        host: { connect: { id: data.hostId } },
        property: { connect: { id: data.propertyId } },
      },
    });

    revalidatePath("/retreats");
    return retreat;
  } catch (error) {
    console.error("Error creating retreat:", error);
    throw new Error("Failed to create retreat");
  }
}

export async function updateRetreat(id: string, data: RetreatInput) {
  try {
    const retreat = await prisma.retreat.update({
      where: { id },
      data: {
        bookingType: data.bookingType,
        name: data.name,
        desc: data.desc,
        duration: data.duration,
        date: new Date(data.date),
        priceList: data.priceList,
        minGuests: data.minGuests,
        maxGuests: data.maxGuests,
        coverImg: data.coverImg,
        sourceUrl: data.sourceUrl,
        host: { connect: { id: data.hostId } },
        property: { connect: { id: data.propertyId } },
      },
    });

    revalidatePath("/retreats");
    return retreat;
  } catch (error) {
    console.error("Error updating retreat:", error);
    throw new Error("Failed to update retreat");
  }
}

type RetreatWithoutNulls = {
  [K in keyof Retreat]: Retreat[K] extends null ? undefined : Retreat[K];
};

export async function getRetreatById(
  id: string
): Promise<RetreatWithoutNulls | null> {
  try {
    const retreat = await prisma.retreat.findUnique({
      where: { id },
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
export async function getRetreatWithPrice(retreatId: string) {
  try {
    const retreat = await prisma.retreat.findUnique({
      where: {
        id: retreatId,
      },
      include: {
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

export async function deleteRetreat(retreatId: string) {
  try {
    const retreat = await prisma.retreat.delete({
      where: {
        id: retreatId,
      },
    });

    revalidatePath("/retreats");

    return retreat;
  } catch (error) {
    console.error(`Error deleting retreat with id ${retreatId}:`, error);
    throw new Error(`Failed to delete retreat with id ${retreatId}`);
  }
}
