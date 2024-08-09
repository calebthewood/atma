"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRetreat(data: {
  name: string;
  description: string;
  duration: string;
  date: Date;
  price: string;
  minGuests: number;
  maxGuests: number;
  hostId: string;
  propertyId: string;
}) {
  try {
    const retreat = await prisma.retreat.create({
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        minGuests: data.minGuests,
        maxGuests: data.maxGuests,
        date: data.date,
        price: data.price,
        hostId: data.hostId,
        propertyId: data.propertyId,
      },
    });

    revalidatePath("/retreats");

    return retreat;
  } catch (error) {
    console.error("Error creating retreat:", error);
    throw new Error("Failed to create retreat");
  }
}

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
            name: true,
            id: true,
          },
        },
      },
    });
    return retreats;
  } catch (error) {
    console.error("Error fetching retreats:", error);
    throw new Error("Failed to fetch retreats");
  }
}

export async function getRetreatById(retreatId: string) {
  try {
    const retreat = await prisma.retreat.findUnique({
      where: {
        id: retreatId,
      },
      include: {
        RetreatInstance: true
      }
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


export async function updateRetreat(retreatId: string, data: {
  name?: string;
  description?: string;
  duration?: string;
  date?: Date;
  price?: string;
  hostId?: string;
  propertyId?: string;
}) {
  try {
    const retreat = await prisma.retreat.update({
      where: {
        id: retreatId,
      },
      data,
    });

    revalidatePath(`/retreats/${retreatId}`);

    return retreat;
  } catch (error) {
    console.error(`Error updating retreat with id ${retreatId}:`, error);
    throw new Error(`Failed to update retreat with id ${retreatId}`);
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