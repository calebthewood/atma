"use server";

import { Program } from "@prisma/client";

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

export async function deleteProgramById(id: string) {
  try {
    await prisma.program.delete({
      where: { id },
    });
    return { success: true, message: "Program deleted successfully" };
  } catch (error) {
    console.error("Error deleting program:", error);
    throw new Error("Failed to delete program");
  }
}

export async function updateProgram(id: string, updateData: Program) {
  try {
    const updatedProgram = await prisma.program.update({
      where: { id },
      data: updateData,
    });
    return updatedProgram;
  } catch (error) {
    console.error("Error updating program:", error);
    throw new Error("Failed to update program");
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
