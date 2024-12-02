"use server";

import { revalidatePath } from "next/cache";
import {
  InstanceFormData,
  instanceFormSchema,
} from "@/schemas/program-instance";
import { PriceMod, type Program, type ProgramInstance } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// ============================================================================
// Types
// ============================================================================

export type BaseInstance = ProgramInstance & {
  program?: {
    name: string | null;
  };
};

export type ProgramWithImages = Program & {
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

export type InstanceWithRelations = ProgramInstance & {
  program: {
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

export async function getInstance(
  id: string
): ActionResponse<InstanceWithRelations> {
  try {
    const instance = await prisma.programInstance.findUnique({
      where: { id },
      include: {
        program: {
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

export async function createInstance(
  data: InstanceFormData
): ActionResponse<ProgramInstance> {
  try {
    // Validate program exists
    const program = await prisma.program.findUnique({
      where: { id: data.programId },
    });

    if (!program) {
      return { success: false, error: "Program not found" };
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

    const instance = await prisma.programInstance.create({
      data: {
        programId: data.programId,
        startDate,
        endDate,
        duration,
        itinerary: data.itinerary,
        availableSlots: data.availableSlots,
        isFull: data.isFull || data.availableSlots === 0,
      },
    });

    revalidatePath("/admin/programs");
    return { success: true, data: instance };
  } catch (error) {
    console.error("Error creating instance:", error);
    return { success: false, error: "Failed to create instance" };
  }
}

export async function updateInstance(
  id: string,
  data: Partial<InstanceFormData>
): ActionResponse<ProgramInstance> {
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

    const instance = await prisma.programInstance.update({
      where: { id },
      data: {
        ...data,
        duration,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isFull: data.availableSlots === 0 ? true : data.isFull,
      },
    });

    revalidatePath("/admin/programs");
    return { success: true, data: instance };
  } catch (error) {
    console.error("Failed to update instance:", error);
    return { success: false, error: "Failed to update instance" };
  }
}

export async function deleteInstance(id: string): ActionResponse {
  try {
    await prisma.programInstance.delete({ where: { id } });
    revalidatePath("/admin/programs");
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
  programId?: string
): ActionResponse<BaseInstance[]> {
  try {
    const where = programId ? { programId } : {};
    const instances = await prisma.programInstance.findMany({
      where,
      include: {
        program: {
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
  programId?: string
): ActionResponse<PaginatedInstancesResponse> {
  try {
    const where = programId ? { programId } : {};
    const skip = (page - 1) * pageSize;

    const [instances, totalCount] = await Promise.all([
      prisma.programInstance.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { startDate: "desc" },
        include: {
          program: {
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
      prisma.programInstance.count({ where }),
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
