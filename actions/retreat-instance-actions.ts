"use server";

import { revalidatePath } from "next/cache";
import { instanceFormSchema } from "@/schemas/retreat-instance";
import { PriceMod, type Retreat, type RetreatInstance } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { ActionResponse } from "./shared";

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

// ============================================================================
// Core CRUD Operations
// ============================================================================
export async function getInstance(id: string): ActionResponse<RetreatInstance> {
  if (!id) {
    return {
      ok: false,
      data: null,
      message: "Instance ID is required",
    };
  }

  try {
    const instance = await prisma.retreatInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      return {
        ok: false,
        data: null,
        message: "Instance not found",
      };
    }

    return {
      ok: true,
      message: "Success",
      data: instance,
    };
  } catch (error) {
    console.log("Error fetching instance:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to fetch instance",
    };
  }
}

export async function updateInstance(
  id: string,
  data: Partial<RetreatInstance>
): ActionResponse<RetreatInstance> {
  if (!id) {
    return {
      ok: false,
      data: null,
      message: "Instance ID is required",
    };
  }

  try {
    const validatedData = instanceFormSchema.partial().parse(data);

    const instance = await prisma.retreatInstance.update({
      where: { id },
      data: validatedData,
    });

    return {
      ok: true,
      message: "Success",
      data: instance,
    };
  } catch (error) {
    console.log("Error updating instance:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to update instance",
    };
  }
}

export async function createInstance(
  data: Omit<
    RetreatInstance,
    "id" | "createdAt" | "updatedAt" | "notes" | "verifiedBy"
  >
): ActionResponse<RetreatInstance> {
  try {
    const validatedData = instanceFormSchema.parse(data);

    const instance = await prisma.retreatInstance.create({
      data: validatedData,
    });
    revalidatePath(`/admin/retreat/${data.retreatId}/instances`);
    return {
      ok: true,
      message: "Success",
      data: instance,
    };
  } catch (error) {
    console.log("Error creating instance:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to create instance",
    };
  }
}

export async function deleteInstance(id: string): ActionResponse {
  try {
    await prisma.retreatInstance.delete({ where: { id } });
    revalidatePath("/admin/retreats");
    return { ok: true, data: null, message: "Success" };
  } catch (error) {
    console.log("Error deleting instance:", error);
    return { ok: false, data: null, message: "Failed to delete instance" };
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
    return { ok: true, message: "Success", data: instances };
  } catch (error) {
    console.log("Error finding instances:", error);
    return { ok: false, data: null, message: "Failed to find instances" };
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
      ok: true,
      message: "Success",
      data: {
        instances: instances as InstanceWithRelations[],
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        totalInstances: totalCount,
      },
    };
  } catch (error) {
    console.log("Error fetching paginated instances:", error);
    return { ok: false, data: null, message: "Failed to fetch instances" };
  }
}
