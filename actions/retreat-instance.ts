"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { RetreatInstance } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getRetreatInstance(id: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  return prisma.retreatInstance.findUnique({
    where: { id },
    include: { retreat: true, bookings: true, priceMods: true },
  });
}

// export async function getRetreatInstances() {
//   const session = await auth();
//   if (!session) {
//     throw new Error("Unauthorized");
//   }

//   return prisma.retreatInstance.findMany({
//     include: { retreat: true, bookings: true, priceMods: true },
//   });
// }

export async function updateRetreatInstance(
  id: string,
  data: {
    startDate?: Date;
    endDate?: Date;
    availableSlots?: number;
    isFull?: boolean;
  }
) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const updatedInstance = await prisma.retreatInstance.update({
    where: { id },
    data,
  });

  revalidatePath("/retreats");
  return updatedInstance;
}

export async function createRetreatInstance(data: {
  retreatId: string;
  startDate: Date;
  endDate: Date;
  availableSlots: number;
}) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const newInstance = await prisma.retreatInstance.create({
    data: {
      ...data,
      isFull: false,
    },
  });

  revalidatePath("/retreats");
  return newInstance;
}

type GetRetreatInstancesResult =
  | {
      success: true;
      instances: RetreatInstance[];
    }
  | {
      success: false;
      error: string;
    };

export async function getRetreatInstances(
  retreatId: string
): Promise<GetRetreatInstancesResult> {
  try {
    const instances = await prisma.retreatInstance.findMany({
      where: {
        retreatId,
      },
      orderBy: {
        startDate: "asc",
      },
      include: {
        priceMods: true,
        bookings: true,
      },
    });

    return {
      success: true,
      instances,
    };
  } catch (error) {
    console.error("Error fetching retreat instances:", error);
    return {
      success: false,
      error: "Failed to fetch retreat instances",
    };
  }
}

export async function deleteRetreatInstance(id: string) {
  try {
    await prisma.retreatInstance.delete({
      where: { id },
    });

    revalidatePath("/admin/retreats");
    return { success: true };
  } catch (error) {
    console.error("Error deleting retreat instance:", error);
    throw new Error("Failed to delete retreat instance");
  }
}
