"use server";

import { revalidatePath } from "next/cache";
import { PriceMod, type Retreat, type RetreatInstance } from "@prisma/client";
import { InstanceFormData, instanceFormSchema } from "@/schemas/retreat-instance";

import { prisma } from "@/lib/prisma";

// ============================================================================
// Types
// ============================================================================

export type BaseInstance = RetreatInstance & {
  retreat?: {
    name: string | null;
  };
};

export type RetreatWithImages = Retreat & {
  images: {
    id: string;
    retreatId: string | null;
    filePath: string;
    desc: string;
    hostId: string | null;
    createdAt: Date;
    updatedAt: Date;
    order: number;
  }[];
};

export type InstanceWithRelations = RetreatInstance & {
  retreat: {
    id: string;
    name: string | null;
    category: string;
    propertyId: string;
    images: {
      id: string;
      retreatId: string | null;
      filePath: string;
      desc: string;
      hostId: string | null;
      createdAt: Date;
      updatedAt: Date;
      order: number;
    }[];
  };
  bookings: {
    id: string;
    guestCount: number;
    status: string;
  }[];
  priceMods: PriceMod[];
};

export type PaginatedInstancesResponse = {
  instances: InstanceWithRelations[];
  totalPages: number;
  currentPage: number;
  totalInstances: number;
};

export type ActionResponse<T = void> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
}>;

// ============================================================================
// Core CRUD Operations
// ============================================================================

export async function createInstance(
  data: InstanceFormData
): ActionResponse<RetreatInstance> {
  try {
    // Validate retreat exists
    const retreat = await prisma.retreat.findUnique({
      where: { id: data.retreatId },
    });

    if (!retreat) {
      return { success: false, error: "Retreat not found" };
    }

    // Parse dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      return { success: false, error: "End date must be after start date" };
    }

    // Calculate duration if not provided
    const duration =
      data.duration ||
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

    const instance = await prisma.retreatInstance.create({
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

    revalidatePath("/admin/retreats");
    return { success: true, data: instance };
  } catch (error) {
    console.error("Error creating retreat instance:", error);
    return { success: false, error: "Failed to create retreat instance" };
  }
}

export async function getInstance(
  id: string
): ActionResponse<InstanceWithRelations> {
  try {
    const instance = await prisma.retreatInstance.findUnique({
      where: { id },
      include: {
        retreat: {
          include: {
            images: true,
          },
          select: {
            id: true,
            name: true,
            propertyId: true,
            category: true,
          },
        },
        bookings: {
          select: {
            id: true,
            guestCount: true,
            status: true,
          },
        },
        priceMods: true,
      },
    });

    if (!instance) {
      return { success: false, error: "Instance not found" };
    }

    return { success: true, data: instance as InstanceWithRelations };
  } catch (error) {
    console.error("Failed to fetch instance:", error);
    return { success: false, error: "Failed to fetch instance" };
  }
}

export async function updateInstance(
  id: string,
  data: Partial<InstanceFormData>
): ActionResponse<RetreatInstance> {
  try {
    let duration = data.duration;
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (endDate <= startDate) {
        return { success: false, error: "End date must be after start date" };
      }

      if (!duration) {
        duration = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    }

    const instance = await prisma.retreatInstance.update({
      where: { id },
      data: {
        ...data,
        duration,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isFull: data.availableSlots === 0 ? true : data.isFull,
      },
    });

    revalidatePath("/admin/retreats");
    return { success: true, data: instance };
  } catch (error) {
    console.error("Failed to update instance:", error);
    return { success: false, error: "Failed to update instance" };
  }
}

export async function deleteInstance(id: string): ActionResponse {
  try {
    await prisma.retreatInstance.delete({ where: { id } });
    revalidatePath("/admin/retreats");
    return { success: true };
  } catch (error) {
    console.error("Error deleting instance:", error);
    return { success: false, error: "Failed to delete instance" };
  }
}

// ============================================================================
// List & Query Operations
// ============================================================================

export async function getInstances(
  retreatId?: string
): ActionResponse<BaseInstance[]> {
  try {
    const where = retreatId ? { retreatId } : {};
    const instances = await prisma.retreatInstance.findMany({
      where,
      include: {
        retreat: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });
    return { success: true, data: instances };
  } catch (error) {
    console.error("Error finding instances:", error);
    return { success: false, error: "Failed to find instances" };
  }
}

export async function getPaginatedInstances(
  page: number = 1,
  pageSize: number = 10,
  retreatId?: string
): ActionResponse<PaginatedInstancesResponse> {
  try {
    const where = retreatId ? { retreatId } : {};
    const skip = (page - 1) * pageSize;

    const [instances, totalCount] = await Promise.all([
      prisma.retreatInstance.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { startDate: "desc" },
        include: {
          retreat: {
            select: {
              name: true,
              propertyId: true,
              images: true,
              category: true,
            },
          },
          bookings: true,
          priceMods: true,
        },
      }),
      prisma.retreatInstance.count({ where }),
    ]);

    return {
      success: true,
      data: {
        instances,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        totalInstances: totalCount,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated instances:", error);
    return { success: false, error: "Failed to fetch instances" };
  }
}
