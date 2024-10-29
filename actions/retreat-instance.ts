"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { RetreatInstanceFormData } from "@/schemas/retreat-instance";

import { prisma } from "@/lib/prisma";

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Helper function to check auth and wrap in try-catch
async function withErrorHandler<T>(
  action: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const data = await action();
    return { success: true, data };
  } catch (error) {
    console.error("Action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function getRetreatInstance(id: string) {
  return withErrorHandler(async () => {
    const instance = await prisma.retreatInstance.findUnique({
      where: { id },
      include: {
        retreat: true,
        bookings: true,
        priceMods: true,
      },
    });

    if (!instance) {
      throw new Error("Retreat instance not found");
    }

    return instance;
  });
}

export async function getPaginatedRetreatInstances(
  page = 1,
  pageSize = 10,
  retreatId?: string
) {
  return withErrorHandler(async () => {
    const where = retreatId ? { retreatId } : {};

    const [instances, total] = await Promise.all([
      prisma.retreatInstance.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          retreat: true,
          bookings: true,
          priceMods: true,
        },
        orderBy: {
          startDate: "desc",
        },
      }),
      prisma.retreatInstance.count({ where }),
    ]);

    return {
      instances,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  });
}

export async function updateRetreatInstance(
  id: string,
  data: Partial<RetreatInstanceFormData>
) {
  return withErrorHandler(async () => {
    // Validate that the instance exists
    const existingInstance = await prisma.retreatInstance.findUnique({
      where: { id },
    });

    if (!existingInstance) {
      throw new Error("Retreat instance not found");
    }

    // If updating dates, ensure they're valid
    if (data.startDate && data.endDate) {
      if (new Date(data.endDate) <= new Date(data.startDate)) {
        throw new Error("End date must be after start date");
      }
    }

    // If updating nights, ensure they're valid
    if (data.minNights && data.maxNights && data.maxNights !== -1) {
      if (data.maxNights < data.minNights) {
        throw new Error("Maximum nights must be greater than minimum nights");
      }
    }

    // Update the instance
    const updatedInstance = await prisma.retreatInstance.update({
      where: { id },
      data: {
        ...data,
        // Ensure dates are properly converted
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    revalidatePath("/admin/retreats");
    revalidatePath("/retreats");

    return updatedInstance;
  });
}

export async function createRetreatInstance(data: RetreatInstanceFormData) {
  return withErrorHandler(async () => {
    // Validate that the retreat exists
    const retreat = await prisma.retreat.findUnique({
      where: { id: data.retreatId },
    });

    if (!retreat) {
      throw new Error("Retreat not found");
    }

    // Create the instance
    const newInstance = await prisma.retreatInstance.create({
      data: {
        retreatId: data.retreatId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        minNights: data.minNights,
        maxNights: data.maxNights,
        availableSlots: data.availableSlots,
        isFull: data.isFull || data.availableSlots === 0,
      },
    });

    revalidatePath("/admin/retreats");
    revalidatePath("/retreats");

    return newInstance;
  });
}

export async function deleteRetreatInstance(id: string) {
  return withErrorHandler(async () => {
    await prisma.retreatInstance.delete({
      where: { id },
    });

    revalidatePath("/admin/retreats");
    revalidatePath("/retreats");

    return { message: "Retreat instance deleted successfully" };
  });
}

// Helper function to get all instances for a specific retreat
export async function getRetreatInstances(retreatId: string) {
  return withErrorHandler(async () => {
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
        retreat: true,
      },
    });

    return instances;
  });
}
