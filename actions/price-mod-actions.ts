"use server";

import { revalidatePath } from "next/cache";
import { PriceModInput, priceModSchema } from "@/schemas/price-mods";
import { PriceMod, Prisma } from "@prisma/client";

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
  ok: boolean;
  error?: string;
  data?: PriceModWithRelations;
};

export type PriceModListResponse = {
  ok: boolean;
  error?: string;
  data?: PriceModWithRelations[];
};

export type PriceModWithSource = PriceMod & {
  source: "property" | "retreat" | "program" | "instance";
};

type GetAllPriceModsResponse = {
  ok: boolean;
  data?: {
    allPriceMods: PriceModWithSource[];
    propertyId?: string;
    retreatId?: string;
    programId?: string;
  };
  error?: string;
};

interface BasePriceModResult {
  propertyId?: string;
  priceMods: PriceModWithSource[];
  error?: string;
}

interface RetreatPriceModResult extends BasePriceModResult {
  retreatId?: string;
}

interface ProgramPriceModResult extends BasePriceModResult {
  programId?: string;
}

export async function getRetreatPriceMods(retreatId: string): Promise<{
  ok: boolean;
  data?: PriceMod[];
  error?: string;
}> {
  try {
    const priceMods = await prisma.priceMod.findMany({
      where: { retreatId },
      orderBy: { createdAt: "desc" },
    });

    return {
      ok: true,
      data: priceMods,
    };
  } catch (error) {
    console.error("Error fetching retreat price mods:", error);
    return {
      ok: false,
      error: "Failed to fetch price modifications",
    };
  }
}

// First, get the related IDs
async function getRelatedIds(instanceId: string, type: "retreat" | "program") {
  try {
    if (type === "retreat") {
      const instance = await prisma.retreatInstance.findUnique({
        where: { id: instanceId },
        select: {
          id: true,
          retreatId: true,
          retreat: {
            select: {
              propertyId: true,
            },
          },
        },
      });

      return {
        instanceId: instance?.id,
        parentId: instance?.retreatId,
        propertyId: instance?.retreat?.propertyId,
      };
    } else {
      const instance = await prisma.programInstance.findUnique({
        where: { id: instanceId },
        select: {
          id: true,
          programId: true,
          program: {
            select: {
              propertyId: true,
            },
          },
        },
      });

      return {
        instanceId: instance?.id,
        parentId: instance?.programId,
        propertyId: instance?.program?.propertyId,
      };
    }
  } catch (error) {
    console.error("Error getting related IDs:", error);
    return null;
  }
}

// Get price mods for a specific entity
async function getPriceModsForEntity(params: {
  propertyId?: string;
  retreatId?: string;
  programId?: string;
  retreatInstanceId?: string;
  programInstanceId?: string;
}): Promise<PriceModWithSource[]> {
  const {
    propertyId,
    retreatId,
    programId,
    retreatInstanceId,
    programInstanceId,
  } = params;

  if (!Object.values(params).some((id) => id)) return [];

  try {
    // Build the OR conditions for valid IDs
    const conditions: Prisma.PriceModWhereInput[] = [];

    if (propertyId) conditions.push({ propertyId });
    if (retreatId) conditions.push({ retreatId });
    if (programId) conditions.push({ programId });
    if (retreatInstanceId) conditions.push({ retreatInstanceId });
    if (programInstanceId) conditions.push({ programInstanceId });

    const priceMods = await prisma.priceMod.findMany({
      where: {
        OR: conditions,
      },
    });

    // Add source to each price mod
    return priceMods.map((mod) => ({
      ...mod,
      source:
        mod.retreatInstanceId || mod.programInstanceId
          ? "instance"
          : mod.retreatId
            ? "retreat"
            : mod.programId
              ? "program"
              : "property",
    }));
  } catch (error) {
    console.error("Error fetching price mods:", error);
    return [];
  }
}

export async function getAllPriceMods(
  instanceId: string,
  type: "retreat" | "program"
): Promise<GetAllPriceModsResponse> {
  try {
    // Get all related IDs
    const ids = await getRelatedIds(instanceId, type);
    if (!ids) {
      return {
        ok: false,
        error: `${type} instance not found`,
      };
    }

    // Get all price mods in a single query
    const allPriceMods = await getPriceModsForEntity({
      propertyId: ids.propertyId,
      retreatId: type === "retreat" ? ids.parentId : undefined,
      programId: type === "program" ? ids.parentId : undefined,
      retreatInstanceId: type === "retreat" ? ids.instanceId : undefined,
      programInstanceId: type === "program" ? ids.instanceId : undefined,
    });

    // Sort the price mods
    const sortedPriceMods = sortPriceMods(allPriceMods);

    return {
      ok: true,
      data: {
        allPriceMods: sortedPriceMods,
        propertyId: ids.propertyId,
        retreatId: type === "retreat" ? ids.parentId : undefined,
        programId: type === "program" ? ids.parentId : undefined,
      },
    };
  } catch (error) {
    console.error("Error fetching price modifications:", error);
    return {
      ok: false,
      error: "Failed to fetch price modifications",
    };
  }
}
function sortPriceMods(priceMods: PriceModWithSource[]): PriceModWithSource[] {
  const sourceOrder = { instance: 0, retreat: 1, program: 1, property: 2 };
  const typeOrder = {
    BASE_PRICE: 0,
    BASE_MOD: 1,
    ADDON: 2,
    FEE: 3,
    TAX: 4,
  };

  return priceMods.sort((a, b) => {
    if (sourceOrder[a.source] !== sourceOrder[b.source]) {
      return sourceOrder[a.source] - sourceOrder[b.source];
    }

    if (a.type !== b.type) {
      return (
        (typeOrder[a.type as keyof typeof typeOrder] || 99) -
        (typeOrder[b.type as keyof typeof typeOrder] || 99)
      );
    }

    return b.value - a.value;
  });
}
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
      ok: true,
      data: priceMod,
    };
  } catch (error) {
    console.error("Error creating price modification:", error);
    return {
      ok: false,
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
        ok: false,
        error: "Price modification not found",
      };
    }

    return {
      ok: true,
      data: priceMod,
    };
  } catch (error) {
    console.error("Error fetching price modification:", error);
    return {
      ok: false,
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
      ok: true,
      data: priceMods,
    };
  } catch (error) {
    console.error("Error fetching price modifications:", error);
    return {
      ok: false,
      error: "Failed to fetch price modifications",
    };
  }
}

export async function getPriceModsByProgramInstance(
  programInstanceId: string
): Promise<PriceModListResponse> {
  try {
    const priceMods = await prisma.priceMod.findMany({
      where: { programInstanceId },
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
      ok: true,
      data: priceMods,
    };
  } catch (error) {
    console.error("Error fetching price modifications:", error);
    return {
      ok: false,
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
      ok: true,
      data: priceMod,
    };
  } catch (error) {
    console.error("Error updating price modification:", error);
    return {
      ok: false,
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
): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.priceMod.delete({
      where: { id },
    });

    return {
      ok: true,
    };
  } catch (error) {
    console.error("Error deleting price modification:", error);
    return {
      ok: false,
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
      revalidatePath(`/admin/host/${relations.host.connect?.id}`);
    }
  }
  if (relations.property) {
    revalidatePath("/admin/property");
    if (relations.property.connect) {
      revalidatePath(`/admin/property/${relations.property.connect?.id}`);
    }
  }
  if (relations.program) {
    revalidatePath("/admin/program");
    if (relations.program.connect) {
      revalidatePath(`/admin/program/${relations.program.connect?.id}`);
    }
  }
  if (relations.retreat) {
    revalidatePath("/admin/retreat");
    if (relations.retreat.connect) {
      revalidatePath(`/admin/retreat/${relations.retreat.connect?.id}`);
    }
  }
}
