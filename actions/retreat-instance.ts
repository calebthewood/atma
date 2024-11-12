"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

// Type for retreat instance with relations
export type RetreatInstanceWithRelations = Prisma.RetreatInstanceGetPayload<{
  include: {
    retreat: true;
    bookings: true;
    priceMods: true;
  };
}>;

// Form data schema matching the updated model
const retreatInstanceFormSchema = z.object({
  retreatId: z.string(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  duration: z.number().default(0),
  itinerary: z
    .string()
    .default("Bulleted list of items, end each point with a semicolon;"),
  availableSlots: z.number(),
  isFull: z.boolean().default(false),
});

type RetreatInstanceFormData = z.infer<typeof retreatInstanceFormSchema>;

// Generic response type
type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Helper function for error handling and auth checking
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

// Get a single retreat instance
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

// Get paginated retreat instances
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

// Create a new retreat instance
export async function createRetreatInstance(data: RetreatInstanceFormData) {
  return withErrorHandler(async () => {
    // Validate retreat exists
    const retreat = await prisma.retreat.findUnique({
      where: { id: data.retreatId },
    });

    if (!retreat) {
      throw new Error("Retreat not found");
    }

    // Parse dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Validate dates
    if (endDate <= startDate) {
      throw new Error("End date must be after start date");
    }

    // Calculate duration if not provided
    const duration =
      data.duration ||
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

    const newInstance = await prisma.retreatInstance.create({
      data: {
        retreatId: data.retreatId,
        startDate,
        endDate,
        duration,
        itinerary: data.itinerary,
        availableSlots: data.availableSlots,
        isFull: data.isFull || data.availableSlots === 0,
      },
    });

    revalidatePath("/admin/retreat");
    revalidatePath("/retreat");

    return newInstance;
  });
}

// Update a retreat instance
export async function updateRetreatInstance(
  id: string,
  data: Partial<RetreatInstanceFormData>
) {
  return withErrorHandler(async () => {
    const existingInstance = await prisma.retreatInstance.findUnique({
      where: { id },
    });

    if (!existingInstance) {
      throw new Error("Retreat instance not found");
    }

    let duration = data.duration;
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (endDate <= startDate) {
        throw new Error("End date must be after start date");
      }

      // Update duration if dates change and duration not explicitly provided
      if (!duration) {
        duration = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    }

    const updatedInstance = await prisma.retreatInstance.update({
      where: { id },
      data: {
        ...data,
        duration,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isFull: data.availableSlots === 0 ? true : data.isFull,
      },
    });

    revalidatePath("/admin/retreat");
    revalidatePath("/retreat");

    return updatedInstance;
  });
}

// Delete a retreat instance
export async function deleteRetreatInstance(id: string) {
  return withErrorHandler(async () => {
    await prisma.retreatInstance.delete({
      where: { id },
    });

    revalidatePath("/admin/retreat");
    revalidatePath("/retreat");

    return { message: "Retreat instance deleted successfully" };
  });
}

// Get all instances for a specific retreat
export async function getRetreatInstances(retreatId: string) {
  return withErrorHandler(async () => {
    const instances = await prisma.retreatInstance.findMany({
      where: { retreatId },
      orderBy: { startDate: "asc" },
      include: {
        retreat: true,
        bookings: true,
        priceMods: true,
      },
    });

    return instances;
  });
}
