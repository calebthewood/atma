"use server";

import { revalidatePath } from "next/cache";
import { programFormSchema } from "@/schemas/program-schema";
import { Prisma, Program } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { haversineDistance, shortNameToContinent } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export type BaseProgram = Program & {
  property?: { name: string };
  host?: { name: string | null };
};

export type Base = Prisma.ProgramGetPayload<{
  include: {
    property: { select: { images: true; city: true; country: true } };
    host: true;
    amenities: true;
    images: true;
    programs: true;
    priceMods: true;
  };
}>;

export type ActionResponse<T = void> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
}>;

export type ProgramFormData = z.infer<typeof programFormSchema>;

export type ProgramWithPropertyGroup = {
  propertyId: string;
  propertyName: string;
  images: any[]; // Replace with proper Image type if available
  programs: Program[];
};

// Define types that exactly match what Prisma returns
export type ProgramWithBasicRelations = Prisma.ProgramGetPayload<{
  include: {
    property: { select: { name: true } };
    host: { select: { name: true } };
  };
}>;

export type PaginatedProgramsResponse = {
  programs: ProgramWithBasicRelations[];
  totalPages: number;
  currentPage: number;
};

// ============================================================================
// Core CRUD Operations
// ============================================================================

export async function createProgram(
  data: ProgramFormData
): ActionResponse<Program> {
  try {
    // Destructure the properties we need to handle specially
    const { hostId, propertyId, date, ...restData } = data;

    // Create the program with properly structured input
    const program = await prisma.program.create({
      data: {
        ...restData,
        date: date ? new Date(date) : null,
        property: {
          connect: { id: propertyId },
        },
        ...(hostId
          ? {
              host: {
                connect: { id: hostId },
              },
            }
          : {}),
      },
    });

    revalidatePath("/admin/program");
    return { success: true, data: program };
  } catch (error) {
    console.error("Error creating program:", error);
    return { success: false, error: "Failed to create program" };
  }
}

// The function implementation
export type ProgramWithAllRelations = Prisma.ProgramGetPayload<{
  include: {
    property: {
      select: {
        images: true;
        name: true;
        city: true;
        country: true;
        nearbyAirport: true;
        address: true;
        tagList: true;
      };
    };
    host: true;
    amenities: true;
    images: true;
    programs: true;
    priceMods: true;
  };
}>;

export async function getProgram(
  id: string
): ActionResponse<ProgramWithAllRelations> {
  try {
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            images: {
              orderBy: {
                order: "asc",
              },
            },
            city: true,
            country: true,
            name: true,
            nearbyAirport: true,
            address: true,
            tagList: true,
          },
        },
        host: true,
        amenities: true,
        images: {
          orderBy: {
            order: "asc",
          },
        },
        programs: true,
        priceMods: true,
      },
    });

    if (!program) {
      return { success: false, error: "Program not found" };
    }

    return { success: true, data: program };
  } catch (error) {
    console.error("Failed to fetch program:", error);
    return { success: false, error: "Failed to fetch program" };
  }
}

export async function updateProgram(
  id: string,
  data: Partial<ProgramFormData>
): ActionResponse<Program> {
  try {
    const program = await prisma.program.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/program");
    revalidatePath(`/admin/program/${id}`);
    return { success: true, data: program };
  } catch (error) {
    console.error("Failed to update program:", error);
    return { success: false, error: "Failed to update program" };
  }
}

export async function deleteProgram(id: string): ActionResponse {
  try {
    await prisma.program.delete({
      where: { id },
    });

    revalidatePath("/admin/program");
    revalidatePath(`/admin/program/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting program:", error);
    return { success: false, error: "Failed to delete program" };
  }
}

// ============================================================================
// List & Query Operations
// ============================================================================

export async function getPrograms(): ActionResponse<ProgramWithAllRelations[]> {
  try {
    const programs = await prisma.program.findMany({
      where: { status: "published" },
      include: {
        property: {
          select: {
            name: true,
            images: {
              orderBy: {
                order: "asc",
              },
            },
            city: true,
            country: true,
            nearbyAirport: true,
            address: true,
            tagList: true,
          },
        },
        host: true,
        amenities: true,
        images: {
          orderBy: {
            order: "asc",
          },
        },
        programs: true,
        priceMods: true,
      },
    });
    return { success: true, data: programs };
  } catch (error) {
    console.error("Error finding programs:", error);
    return { success: false, error: "Failed to find programs" };
  }
}

export async function getPaginatedPrograms(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
): ActionResponse<PaginatedProgramsResponse> {
  try {
    const skip = (page - 1) * pageSize;
    const where: Prisma.ProgramWhereInput = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm } },
            { duration: { contains: searchTerm } },
            { desc: { contains: searchTerm } },
          ],
        }
      : {};

    const [programs, totalCount] = await Promise.all([
      prisma.program.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
        include: {
          property: { select: { name: true } },
          host: { select: { name: true } },
        },
      }),
      prisma.program.count({ where }),
    ]);

    return {
      success: true,
      data: {
        programs,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated programs:", error);
    return { success: false, error: "Failed to fetch programs" };
  }
}

// ============================================================================
// Property-Related Operations
// ============================================================================

export async function getProgramsByProperty(
  propertyId: string
): ActionResponse<BaseProgram[]> {
  try {
    const programs = await prisma.program.findMany({
      where: { propertyId },
      include: { property: true },
    });
    return { success: true, data: programs };
  } catch (error) {
    console.error("Error finding programs:", error);
    return { success: false, error: "Failed to find programs" };
  }
}

export async function getProgramsGroupedByProperty(): ActionResponse<
  ProgramWithPropertyGroup[]
> {
  try {
    const propertiesWithPrograms = await prisma.property.findMany({
      include: {
        programs: true,
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
      where: {
        programs: {
          some: {},
        },
      },
    });

    const groupedPrograms = propertiesWithPrograms.map((property) => ({
      propertyId: property?.id,
      propertyName: property?.name,
      images: property?.images,
      programs: property?.programs,
    }));

    return { success: true, data: groupedPrograms };
  } catch (error) {
    console.error("Error finding programs grouped by property:", error);
    return {
      success: false,
      error: "Failed to find programs grouped by property",
    };
  }
}

export async function getProgramsWithNoProperty(): ActionResponse<Program[]> {
  try {
    const programs = await prisma.program.findMany({
      where: {
        propertyId: undefined,
      },
    });
    return { success: true, data: programs };
  } catch (error) {
    console.error("Error finding programs with no property:", error);
    return {
      success: false,
      error: "Failed to find programs with no property",
    };
  }
}

export async function joinProgramAndProperty(
  programId: string,
  propertyId: string
): ActionResponse<Program> {
  try {
    const program = await prisma.program.update({
      where: { id: programId },
      data: {
        property: { connect: { id: propertyId } },
      },
      include: { property: true },
    });
    return { success: true, data: program };
  } catch (error) {
    console.error("Error joining program and property:", error);
    return { success: false, error: "Failed to join program and property" };
  }
}
