"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { programFormSchema } from "@/schemas/program-schema";
import { Prisma, Program } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";

import { ActionResponse, PaginatedResponse } from "./shared";

// ============================================================================
// Shared Query Configurations
// ============================================================================

const PROGRAM_INCLUDE_FULL = {
  property: {
    select: {
      images: { orderBy: { order: "asc" } },
      name: true,
      city: true,
      country: true,
      nearbyAirport: true,
      address: true,
      tagList: true,
    },
  },
  host: true,
  amenities: true,
  images: { orderBy: { order: "asc" } },
  programs: true,
  priceMods: true,
} as const;

const PROGRAM_INCLUDE_ADMIN_LIST = {
  property: {
    select: {
      name: true,
      city: true,
      country: true,
    },
  },
  host: {
    select: {
      name: true,
      id: true,
    },
  },
  images: {
    take: 1,
    orderBy: { order: "asc" },
  },
  programs: {
    select: {
      startDate: true,
      endDate: true,
      availableSlots: true,
    },
    orderBy: { startDate: "asc" },
    take: 1,
  },
} as const;

// ============================================================================
// Types
// ============================================================================

export type ProgramFormData = z.infer<typeof programFormSchema>;
export type ProgramWithAllRelations = Prisma.ProgramGetPayload<{
  include: typeof PROGRAM_INCLUDE_FULL;
}>;
export type ProgramWithBasicRelations = Prisma.ProgramGetPayload<{
  include: typeof PROGRAM_INCLUDE_ADMIN_LIST;
}>;

// ============================================================================
// Core CRUD Operations
// ============================================================================

export async function createProgram(
  data: ProgramFormData
): ActionResponse<Program> {
  try {
    const { hostId, propertyId, ...restData } = data;
    const program = await prisma.program.create({
      data: {
        ...restData,
        property: { connect: { id: propertyId } },
        host: { connect: { id: hostId || "" } },
      },
    });
    return { ok: true, data: program, message: "Successfully created program" };
  } catch (error) {
    console.error(error);
    return { ok: false, data: null, message: "Error creating program" };
  }
}

export async function getProgram(
  id: string,
  statusList = ["published"]
): ActionResponse<ProgramWithAllRelations> {
  try {
    const program = await prisma.program.findUnique({
      where: { id, status: { in: statusList } },
      include: PROGRAM_INCLUDE_FULL,
    });

    if (!program) {
      return { ok: false, data: null, message: "Program not found" };
    }

    return { ok: true, data: program, message: "Successfully fetched program" };
  } catch (error) {
    return { ok: false, data: null, message: "Error fetching program" };
  }
}

export async function updateProgram(
  id: string,
  partialData: Partial<ProgramFormData>
): ActionResponse<Program> {
  try {
    const { hostId, ...restData } = partialData;

    const updateData: Prisma.ProgramUpdateInput = {
      ...restData,
      ...(hostId !== undefined
        ? {
            host: {
              connect: { id: hostId || "" }, // If hostId is null, this will throw an error
            },
          }
        : {}),
    };

    const program = await prisma.program.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/program");
    revalidatePath(`/admin/program/${id}`);
    return { ok: true, data: program, message: "Succesfully updated program." };
  } catch (error) {
    console.error("Failed to update program:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to update program. Host is required.",
    };
  }
}

export async function deleteProgram(id: string): ActionResponse {
  try {
    await prisma.program.delete({ where: { id } });
    revalidatePath("/admin/program");
    revalidatePath(`/admin/program/${id}`);
    return { ok: true, data: null, message: "Successfully deleted program" };
  } catch (error) {
    return { ok: false, data: null, message: "Error deleting program" };
  }
}

export async function getPrograms(): ActionResponse<ProgramWithAllRelations[]> {
  try {
    const programs = await prisma.program.findMany({
      where: { status: "published" },
      include: PROGRAM_INCLUDE_FULL,
    });
    return {
      ok: true,
      data: programs,
      message: "Successfully fetched programs",
    };
  } catch (error) {
    return { ok: false, data: null, message: "Error fetching programs" };
  }
}

export async function getAdminPaginatedPrograms(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
): Promise<ActionResponse<PaginatedResponse<ProgramWithBasicRelations>>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized access" };
    }

    const whereClause = {
      status: { in: ["published", "draft", "archived"] },
      ...(searchTerm
        ? {
            OR: [
              { name: { contains: searchTerm } },
              { duration: { contains: searchTerm } },
              { desc: { contains: searchTerm } },
              { category: { contains: searchTerm } },
            ],
          }
        : {}),
      ...(session.user.role !== "admin" ? { hostId: session.user.hostId } : {}),
    };

    const [programs, totalCount] = await Promise.all([
      prisma.program.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
        include: PROGRAM_INCLUDE_ADMIN_LIST,
      }),
      prisma.program.count({ where: whereClause }),
    ]);

    return {
      ok: true,
      data: {
        items: programs,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
      message: "Successfully fetched paginated programs",
    };
  } catch (error) {
    console.error("Error in getAdminPaginatedPrograms:", error);
    return {
      ok: false,
      data: null,
      message: "Error fetching paginated programs",
    };
  }
}
