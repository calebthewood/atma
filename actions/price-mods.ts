"use server";

import { revalidatePath } from "next/cache";
import { PriceModInput, priceModSchema } from "@/schemas/price-mods";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// Type Definitions
export type PriceModWithRelations = Prisma.PriceModGetPayload<{
  include: {
    host: true;
    property: true;
    program: true;
    retreat: true;
    retreatInstance: true;
  };
}>;

export type PriceModResponse = {
  success: boolean;
  error?: string;
  data?: PriceModWithRelations;
};

export type PriceModListResponse = {
  success: boolean;
  error?: string;
  data?: PriceModWithRelations[];
};

/**
 * Create a new price modification
 */
export async function createPriceMod(
  data: PriceModInput
): Promise<PriceModResponse> {
  try {
    const validatedData = priceModSchema.parse(data);

    const relations: any = {};
    if (validatedData.hostId) {
      relations.host = { connect: { id: validatedData.hostId } };
    }
    if (validatedData.propertyId) {
      relations.property = { connect: { id: validatedData.propertyId } };
    }
    if (validatedData.programId) {
      relations.program = { connect: { id: validatedData.programId } };
    }
    if (validatedData.retreatId) {
      relations.retreat = { connect: { id: validatedData.retreatId } };
    }
    if (validatedData.retreatInstanceId) {
      relations.retreatInstance = {
        connect: { id: validatedData.retreatInstanceId },
      };
    }

    const {
      hostId,
      propertyId,
      programId,
      retreatId,
      retreatInstanceId,
      ...priceModData
    } = validatedData;

    const priceMod = await prisma.priceMod.create({
      data: {
        ...priceModData,
        ...relations,
      },
      include: {
        host: true,
        property: true,
        program: true,
        retreat: true,
        retreatInstance: true,
      },
    });

    revalidateRelatedPaths(relations);

    return {
      success: true,
      data: priceMod,
    };
  } catch (error) {
    console.error("Error creating price modification:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create price modification",
    };
  }
}

/**
 * Get a price modification by ID
 */
export async function getPriceMod(id: string): Promise<PriceModResponse> {
  try {
    const priceMod = await prisma.priceMod.findUnique({
      where: { id },
      include: {
        host: true,
        property: true,
        program: true,
        retreat: true,
        retreatInstance: true,
      },
    });

    if (!priceMod) {
      return {
        success: false,
        error: "Price modification not found",
      };
    }

    return {
      success: true,
      data: priceMod,
    };
  } catch (error) {
    console.error("Error fetching price modification:", error);
    return {
      success: false,
      error: "Failed to fetch price modification",
    };
  }
}

/**
 * Get price modifications for a retreat instance
 */
export async function getPriceModsByRetreatInstance(
  retreatInstanceId: string
): Promise<PriceModListResponse> {
  try {
    const priceMods = await prisma.priceMod.findMany({
      where: { retreatInstanceId },
      orderBy: { createdAt: "desc" },
      include: {
        host: true,
        property: true,
        program: true,
        retreat: true,
        retreatInstance: true,
      },
    });

    return {
      success: true,
      data: priceMods,
    };
  } catch (error) {
    console.error("Error fetching price modifications:", error);
    return {
      success: false,
      error: "Failed to fetch price modifications",
    };
  }
}

/**
 * Update a price modification
 */
export async function updatePriceMod(
  id: string,
  data: Partial<PriceModInput>
): Promise<PriceModResponse> {
  try {
    const validatedData = priceModSchema.partial().parse(data);

    const relations: any = {};
    if (validatedData.hostId !== undefined) {
      relations.host = validatedData.hostId
        ? { connect: { id: validatedData.hostId } }
        : { disconnect: true };
    }
    if (validatedData.propertyId !== undefined) {
      relations.property = validatedData.propertyId
        ? { connect: { id: validatedData.propertyId } }
        : { disconnect: true };
    }
    if (validatedData.programId !== undefined) {
      relations.program = validatedData.programId
        ? { connect: { id: validatedData.programId } }
        : { disconnect: true };
    }
    if (validatedData.retreatId !== undefined) {
      relations.retreat = validatedData.retreatId
        ? { connect: { id: validatedData.retreatId } }
        : { disconnect: true };
    }
    if (validatedData.retreatInstanceId !== undefined) {
      relations.retreatInstance = validatedData.retreatInstanceId
        ? { connect: { id: validatedData.retreatInstanceId } }
        : { disconnect: true };
    }

    const {
      hostId,
      propertyId,
      programId,
      retreatId,
      retreatInstanceId,
      ...priceModData
    } = validatedData;

    const priceMod = await prisma.priceMod.update({
      where: { id },
      data: {
        ...priceModData,
        ...relations,
      },
      include: {
        host: true,
        property: true,
        program: true,
        retreat: true,
        retreatInstance: true,
      },
    });

    revalidateRelatedPaths(relations);

    return {
      success: true,
      data: priceMod,
    };
  } catch (error) {
    console.error("Error updating price modification:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update price modification",
    };
  }
}

/**
 * Delete a price modification
 */
export async function deletePriceMod(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.priceMod.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting price modification:", error);
    return {
      success: false,
      error: "Failed to delete price modification",
    };
  }
}

/**
 * Helper function to revalidate related paths
 */
function revalidateRelatedPaths(relations: Record<string, any>) {
  if (relations.host) {
    revalidatePath("/admin/host");
    if (relations.host.connect) {
      revalidatePath(`/admin/host/${relations.host.connect.id}`);
    }
  }
  if (relations.property) {
    revalidatePath("/admin/property");
    if (relations.property.connect) {
      revalidatePath(`/admin/property/${relations.property.connect.id}`);
    }
  }
  if (relations.program) {
    revalidatePath("/admin/program");
    if (relations.program.connect) {
      revalidatePath(`/admin/program/${relations.program.connect.id}`);
    }
  }
  if (relations.retreat) {
    revalidatePath("/admin/retreat");
    if (relations.retreat.connect) {
      revalidatePath(`/admin/retreat/${relations.retreat.connect.id}`);
    }
  }
}
