"use server";

import { revalidatePath } from "next/cache";
import { programFormSchema } from "@/schemas/program-schema";
import { Prisma, Program } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";

export async function getProgramById(id: string) {
  try {
    const program = await prisma.program.findUnique({
      where: { id },
      include: { property: { include: { images: true } } },
    });
    return program;
  } catch (error) {
    console.error("Error finding program:", error);
    throw new Error("Failed to find program");
  }
}

export async function getPrograms() {
  try {
    const programs = await prisma.program.findMany({
      include: { property: true },
    });
    return programs;
  } catch (error) {
    console.error("Error finding program:", error);
    throw new Error("Failed to find program");
  }
}

export async function getProgramsGroupedByProperty() {
  try {
    const propertiesWithPrograms = await prisma.property.findMany({
      include: {
        programs: true,
        images: true,
      },
      where: {
        programs: {
          some: {},
        },
      },
    });

    const groupedPrograms = propertiesWithPrograms.map((property) => ({
      propertyId: property.id,
      propertyName: property.name,
      images: property.images,
      programs: property.programs,
    }));

    return groupedPrograms;
  } catch (error) {
    console.error("Error finding programs grouped by property:", error);
    throw new Error("Failed to find programs grouped by property");
  }
}

export async function getProgramsByProperty(propertyId: string) {
  try {
    const programs = await prisma.program.findMany({
      where: { propertyId },
      include: { property: true },
    });
    return programs;
  } catch (error) {
    console.error("Error finding programs:", error);
    throw new Error("Failed to find programs");
  }
}

export type ProgramWithRelations = Prisma.ProgramGetPayload<{
  include: {
    property: true;
    images: true;
  };
}>;

// Define response type
export type GetProgramResponse =
  | {
      success: true;
      program: ProgramWithRelations;
    }
  | {
      success: false;
      error: string;
    };

export async function getProgramsWithProperty(
  propertyId: string
): Promise<GetProgramResponse> {
  try {
    const program = await prisma.program.findFirst({
      where: { propertyId, status: "published" },
      include: {
        property: true,
        images: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!program) {
      return {
        success: false,
        error: "Program not found",
      };
    }

    return {
      success: true,
      program,
    };
  } catch (error) {
    console.error("Error finding programs:", error);
    return {
      success: false,
      error: "Failed to find programs",
    };
  }
}

export async function deleteProgram(id: string) {
  try {
    await prisma.program.delete({
      where: { id },
    });
    revalidatePath("/admin/programs");
    revalidatePath(`/admin/programs/${id}`);
    return { success: true, message: "Program deleted successfully" };
  } catch (error) {
    console.error("Error deleting program:", error);
    throw new Error("Failed to delete program");
  }
}

export async function getProgramsWithNoProperty() {
  try {
    const programs = await prisma.program.findMany({
      where: {
        propertyId: undefined,
      },
    });
    return programs;
  } catch (error) {
    console.error("Error finding programs with no property:", error);
    throw new Error("Failed to find programs with no property");
  }
}

export async function joinProgramAndProperty(
  programId: string,
  propertyId: string
) {
  try {
    const updatedProgram = await prisma.program.update({
      where: { id: programId },
      data: {
        property: { connect: { id: propertyId } },
      },
      include: { property: true },
    });
    return updatedProgram;
  } catch (error) {
    console.error("Error joining program and property:", error);
    throw new Error("Failed to join program and property");
  }
}

export async function getPaginatedPrograms(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
) {
  const skip = (page - 1) * pageSize;

  try {
    const where: Prisma.ProgramWhereInput = {
      OR: [
        { name: { contains: searchTerm } },
        { duration: { contains: searchTerm } },
        { desc: { contains: searchTerm } },
      ],
    };

    // Fetch programs with pagination and search
    const programs = await prisma.program.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
      include: {
        property: {
          select: {
            name: true,
          },
        },
        host: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.program.count({ where });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      programs,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching paginated programs:", error);
    throw new Error("Failed to fetch programs");
  }
}

export async function createProgram(data: {
  name: string;
  duration?: string;
  desc?: string;
  priceList?: string;
  sourceUrl?: string;
  propertyId: string;
  hostId?: string;
}) {
  try {
    const program = await prisma.program.create({
      data: {
        name: data.name,
        duration: data.duration,
        desc: data.desc,
        priceList: data.priceList,
        sourceUrl: data.sourceUrl,
        property: { connect: { id: data.propertyId } },
        host: { connect: { id: data.hostId } },
      },
    });

    revalidatePath("/admin/programs");
    return { success: true, program };
  } catch (error) {
    console.error("Failed to create program:", error);
    return { success: false, error: "Failed to create program" };
  }
}

export async function updateProgram(
  id: string,
  data: Partial<z.infer<typeof programFormSchema>>
) {
  try {
    const program = await prisma.program.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/programs");
    revalidatePath(`/admin/programs/${id}`);
    return { success: true, program };
  } catch (error) {
    console.error("Failed to update program:", error);
    return { success: false, error: "Failed to update program" };
  }
}

export async function getProgram(id: string) {
  try {
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        property: { select: { name: true } },
        host: { select: { name: true } },
      },
    });

    if (!program) {
      return { success: false, error: "Program not found" };
    }

    return { success: true, program };
  } catch (error) {
    console.error("Failed to fetch program:", error);
    return { success: false, error: "Failed to fetch program" };
  }
}
