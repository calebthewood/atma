"use server";

import { revalidatePath } from "next/cache";
import {
  InstanceFormData,
  instanceFormSchema,
} from "@/schemas/retreat-instance";
import { PriceMod, type Retreat, type RetreatInstance } from "@prisma/client";

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
    propertyId: string;
    category: string;
    images: {
      id: string;
      programId: string | null;
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
export async function getInstance(id: string): ActionResponse<RetreatInstance> {
  if (!id) {
    return {
      success: false,
      error: "Instance ID is required",
    };
  }

  try {
    const instance = await prisma.retreatInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      return {
        success: false,
        error: "Instance not found",
      };
    }

    return {
      success: true,
      data: instance,
    };
  } catch (error) {
    console.error("Error fetching instance:", error);
    return {
      success: false,
      error: "Failed to fetch instance",
    };
  }
}

export async function updateInstance(
  id: string,
  data: Partial<RetreatInstance>
): ActionResponse<RetreatInstance> {
  if (!id) {
    return {
      success: false,
      error: "Instance ID is required",
    };
  }

  try {
    const validatedData = instanceFormSchema.partial().parse(data);

    const instance = await prisma.retreatInstance.update({
      where: { id },
      data: validatedData,
    });

    return {
      success: true,
      data: instance,
    };
  } catch (error) {
    console.error("Error updating instance:", error);
    return {
      success: false,
      error: "Failed to update instance",
    };
  }
}

export async function createInstance(
  data: Omit<RetreatInstance, "id" | "createdAt" | "updatedAt">
): ActionResponse<RetreatInstance> {
  try {
    const validatedData = instanceFormSchema.parse(data);

    const instance = await prisma.retreatInstance.create({
      data: validatedData,
    });

    return {
      success: true,
      data: instance,
    };
  } catch (error) {
    console.error("Error creating instance:", error);
    return {
      success: false,
      error: "Failed to create instance",
    };
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
              id: true,
              name: true,
              propertyId: true,
              category: true,
              images: {
                select: {
                  id: true,
                  programId: true,
                  filePath: true,
                  desc: true,
                  hostId: true,
                  createdAt: true,
                  updatedAt: true,
                  order: true,
                },
              },
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
      }),
      prisma.retreatInstance.count({ where }),
    ]);

    return {
      success: true,
      data: {
        instances: instances as InstanceWithRelations[],
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
