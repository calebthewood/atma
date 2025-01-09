/** ToC
 * Core CRUD Operations:
 *   - createRetreat(data: RetreatFormData)
 *   - getRetreat(id: string)
 *   - updateRetreat(id: string, data: Partial<RetreatFormData>)
 *   - deleteRetreat(id: string)
 *
 * Admin List Operations:
 *   - getAdminPaginatedRetreats(page?: number, pageSize?: number, searchTerm?: string)
 *
 * Public List Operations:
 *   - getPublicRetreats()
 */
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { retreatFormSchema } from "@/schemas/retreat-schema";
import { Prisma, Retreat } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";

import {
  ActionResponse,
  buildRetreatSearchConditions,
  COMMON_ADMIN_LIST_INCLUDE,
  COMMON_PROPERTY_SELECT,
  getPaginationParams,
  PaginatedResponse,
} from "./shared";

// ============================================================================
// Shared Query Configurations
// ============================================================================

const RETREAT_INCLUDE_FULL = {
  property: {
    select: COMMON_PROPERTY_SELECT,
  },
  host: true,
  amenities: true,
  images: { orderBy: { order: "asc" } },
  retreatInstances: {
    include: {
      priceMods: true,
    },
  },
  priceMods: true,
} as const;

const RETREAT_INCLUDE_ADMIN_LIST = {
  ...COMMON_ADMIN_LIST_INCLUDE,
  retreatInstances: {
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

export type RetreatFormData = z.infer<typeof retreatFormSchema>;
export type RetreatWithAllRelations = Prisma.RetreatGetPayload<{
  include: typeof RETREAT_INCLUDE_FULL;
}>;
export type RetreatWithBasicRelations = Prisma.RetreatGetPayload<{
  include: typeof RETREAT_INCLUDE_ADMIN_LIST;
}>;

// ============================================================================
// Core CRUD Operations
// ============================================================================

export async function createRetreat(
  data: RetreatFormData
): ActionResponse<Retreat> {
  try {
    const { hostId, propertyId, ...restData } = data;

    const retreat = await prisma.retreat.create({
      data: {
        ...restData,
        property: { connect: { id: propertyId } },
        host: { connect: { id: hostId || "" } },
      },
    });

    return {
      ok: true,
      data: retreat,
      message: "Successfully created retreat",
    };
  } catch (error) {
    console.error("Error creating retreat:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to create retreat. Host is required.",
    };
  }
}

export async function getRetreat(
  id: string
): ActionResponse<RetreatWithAllRelations> {
  const statusList = ["published"];
  const session = await auth();
  if (session && session.user.role !== "user") {
    statusList.push("draft");
  }
  try {
    const retreat = await prisma.retreat.findUnique({
      where: { id, status: { in: statusList } },
      include: RETREAT_INCLUDE_FULL,
    });

    if (!retreat) {
      return {
        ok: false,
        data: null,
        message: "Retreat not found",
      };
    }

    return {
      ok: true,
      data: retreat,
      message: "Successfully fetched retreat",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error fetching retreat",
    };
  }
}

export async function updateRetreat(
  id: string,
  partialData: Partial<RetreatFormData>
): ActionResponse<Retreat> {
  try {
    const { hostId, propertyId, ...restData } = partialData;
    if (!hostId) {
      throw new Error("Host ID is required for retreat updates");
    }

    // const updateData: Prisma.RetreatUpdateInput = {
    //   ...restData,
    //   ...(hostId !== undefined
    //     ? { host: { connect: { id: hostId || "" } } }
    //     : {}),
    // };

    const updateData: Prisma.RetreatUpdateInput = {
      ...restData,
      host: { connect: { id: hostId } },
      property: { connect: { id: propertyId } },
    };

    const retreat = await prisma.retreat.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/retreat");
    revalidatePath(`/admin/retreat/${id}`);
    return {
      ok: true,
      data: retreat,
      message: "Successfully updated retreat",
    };
  } catch {
    return {
      ok: false,
      data: null,
      message: "Failed to update retreat.",
    };
  }
}

export async function deleteRetreat(id: string): ActionResponse {
  try {
    await prisma.retreat.delete({ where: { id } });
    revalidatePath("/admin/retreat");
    revalidatePath(`/admin/retreat/${id}`);
    return {
      ok: true,
      data: null,
      message: "Successfully deleted retreat",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error deleting retreat",
    };
  }
}

// ============================================================================
// Admin List Operations
// ============================================================================

export async function getAdminPaginatedRetreats(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
): Promise<ActionResponse<PaginatedResponse<RetreatWithBasicRelations>>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        ok: false,
        data: null,
        message: "Unauthorized access",
      };
    }

    const { skip, take } = getPaginationParams({ page, pageSize });
    const searchConditions = buildRetreatSearchConditions(searchTerm, [
      "duration",
      "desc",
      "category",
    ]);

    const whereClause = {
      status: { in: ["published", "draft"] },
      ...searchConditions,
      ...(session.user.role !== "admin" ? { hostId: session.user.hostId } : {}),
    };

    const [retreats, totalCount] = await Promise.all([
      prisma.retreat.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        include: RETREAT_INCLUDE_ADMIN_LIST,
      }),
      prisma.retreat.count({ where: whereClause }),
    ]);

    return {
      ok: true,
      data: {
        items: retreats,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
      message: "Successfully fetched paginated retreats",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error fetching paginated retreats",
    };
  }
}

// ============================================================================
// Public List Operations
// ============================================================================

export async function getPublicRetreats(): ActionResponse<
  RetreatWithAllRelations[]
> {
  try {
    const retreats = await prisma.retreat.findMany({
      where: { status: "published" },
      include: RETREAT_INCLUDE_FULL,
    });

    return {
      ok: true,
      data: retreats,
      message: "Successfully fetched public retreats",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error fetching public retreats",
    };
  }
}
