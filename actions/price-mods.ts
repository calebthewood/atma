"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const priceModSchema = z.object({
  name: z.string().min(2),
  desc: z.string().optional(),
  type: z.enum(["FIXED", "PERCENT"]),
  // category: z.string().min(1),
  value: z.number().int(),
  dateRange: z.string(),
  guestRange: z.string(),
  roomType: z.string(),
  hostId: z.string().nullable().optional(),
  propertyId: z.string().nullable().optional(),
  programId: z.string().nullable().optional(),
  retreatId: z.string().nullable().optional(),
  retreatInstanceId: z.string().nullable().optional(),
});

type PriceModInput = z.infer<typeof priceModSchema>;

/**
 * Create a new price modification
 */
export async function createPriceMod(data: PriceModInput) {
  try {
    // Validate input data
    const validatedData = priceModSchema.parse(data);

    // Create relations object based on provided IDs
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

    // Remove relation IDs from the main data object
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
    });

    // Revalidate all potential paths
    revalidateRelatedPaths(relations);

    return { success: true, data: priceMod };
  } catch (error) {
    console.error("Error creating price modification:", error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }
    throw new Error("Failed to create price modification");
  }
}

/**
 * Get a price modification by ID
 */
export async function getPriceMod(id: string) {
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
      throw new Error("Price modification not found");
    }

    return priceMod;
  } catch (error) {
    console.error("Error fetching price modification:", error);
    throw new Error("Failed to fetch price modification");
  }
}

/**
 * Update a price modification
 */
export async function updatePriceMod(id: string, data: Partial<PriceModInput>) {
  try {
    // Validate the update data
    const validatedData = priceModSchema.partial().parse(data);

    // Handle relations
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

    // Remove relation IDs from the main data object
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
    });

    // Revalidate all potential paths
    revalidateRelatedPaths(relations);

    return { success: true, data: priceMod };
  } catch (error) {
    console.error("Error updating price modification:", error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }
    throw new Error("Failed to update price modification");
  }
}

/**
 * Helper function to revalidate related paths
 */
function revalidateRelatedPaths(relations: Record<string, any>) {
  if (relations.host) {
    revalidatePath("/admin/hosts");
    if (relations.host.connect) {
      revalidatePath(`/admin/hosts/${relations.host.connect.id}`);
    }
  }
  if (relations.property) {
    revalidatePath("/admin/properties");
    if (relations.property.connect) {
      revalidatePath(`/admin/properties/${relations.property.connect.id}`);
    }
  }
  if (relations.program) {
    revalidatePath("/admin/programs");
    if (relations.program.connect) {
      revalidatePath(`/admin/programs/${relations.program.connect.id}`);
    }
  }
  if (relations.retreat) {
    revalidatePath("/admin/retreats");
    if (relations.retreat.connect) {
      revalidatePath(`/admin/retreats/${relations.retreat.connect.id}`);
    }
  }
  if (relations.retreatInstance) {
    revalidatePath("/admin/retreat-instances");
    if (relations.retreatInstance.connect) {
      revalidatePath(
        `/admin/retreat-instances/${relations.retreatInstance.connect.id}`
      );
    }
  }
}
