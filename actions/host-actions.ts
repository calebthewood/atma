// actions/host-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { hostFormSchema } from "@/schemas/host-schema";
import { Host, HostUser, Prisma } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";

import {
  ActionResponse,
  getPaginationParams,
  PaginatedResponse,
} from "./shared";

/** ToC
 * Query Configurations:
 *   - HOST_INCLUDE_FULL
 *   - HOST_INCLUDE_ADMIN_LIST
 *   - HOST_USER_INCLUDE_BASIC
 *
 * Core CRUD Operations:
 *   - createHost(data: HostFormData): Promise<ActionResponse<Host>>
 *   - getHost(id: string): Promise<ActionResponse<HostWithAllRelations>>
 *   - updateHost(id: string, data: Partial<HostFormData>): Promise<ActionResponse<Host>>
 *   - deleteHost(id: string): Promise<ActionResponse>
 *
 * Admin Operations:
 *   - getAdminPaginatedHosts(page?: number, pageSize?: number, searchTerm?: string): Promise<ActionResponse<PaginatedResponse<HostWithBasicRelations>>>
 *
 * Host User Operations:
 *   - getCurrentHostUser(userId: string): Promise<ActionResponse<HostUserWithRelations>>
 *   - upsertHostUser(data: HostUserFormData): Promise<ActionResponse<HostUser>>
 *   - removeHostUser(userId: string, hostId: string): Promise<ActionResponse>
 */

// ============================================================================
// Query Configurations
// ============================================================================

const HOST_INCLUDE_FULL = {
  hostUser: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  },
  images: {
    orderBy: {
      order: "asc",
    },
  },
  properties: {
    select: {
      id: true,
      name: true,
      city: true,
      country: true,
    },
  },
  amenities: {
    include: {
      amenity: true,
    },
  },
  retreats: {
    select: {
      id: true,
      name: true,
      status: true,
    },
    where: {
      status: "published",
    },
    take: 10,
  },
  programs: {
    select: {
      id: true,
      name: true,
      status: true,
    },
    where: {
      status: "published",
    },
    take: 10,
  },
} satisfies Prisma.HostInclude;

const HOST_INCLUDE_ADMIN_LIST = {
  hostUser: {
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  },
  images: {
    orderBy: {
      order: "asc",
    },
    take: 1,
  },
  properties: {
    select: {
      id: true,
      name: true,
    },
    take: 3,
  },
} satisfies Prisma.HostInclude;

const HOST_USER_INCLUDE_BASIC = {
  host: {
    select: {
      id: true,
      name: true,
      type: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.HostUserInclude;

// ============================================================================
// Types
// ============================================================================

export type HostFormData = z.infer<typeof hostFormSchema>;

export type HostUserFormData = {
  userId: string;
  hostId: string;
  permissions: string;
  assignedBy: string;
};

export type HostWithAllRelations = Prisma.HostGetPayload<{
  include: typeof HOST_INCLUDE_FULL;
}>;

export type HostWithBasicRelations = Prisma.HostGetPayload<{
  include: typeof HOST_INCLUDE_ADMIN_LIST;
}>;

export type HostUserWithRelations = Prisma.HostUserGetPayload<{
  include: typeof HOST_USER_INCLUDE_BASIC;
}>;

function buildHostSearchConditions(searchTerm: string): Prisma.HostWhereInput {
  if (!searchTerm) return {};

  return {
    OR: [
      { name: { contains: searchTerm } },
      { email: { contains: searchTerm } },
      { phone: { contains: searchTerm } },
      { type: { contains: searchTerm } },
    ],
  };
}

// ============================================================================
// Core CRUD Operations
// ============================================================================

export async function createHost(
  data: HostFormData
): Promise<ActionResponse<Host>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    const hostData = {
      name: data.name,
      type: data.type,
      desc: data.desc || null,
      email: data.email || null,
      phone: data.phone || null,
      profilePic: data.profilePic || null,
      coverImg: data.coverImg || null,
      thumbnail: data.thumbnail || null,
      hostUser: {
        create: {
          userId: session.user.id,
          permissions: "crud",
          assignedBy: session.user.id,
        },
      },
    };

    const host = await prisma.host.create({
      data: hostData,
      include: HOST_INCLUDE_FULL,
    });

    revalidatePath("/admin/host");
    return {
      ok: true,
      data: host,
      message: "Successfully created host",
    };
  } catch (error) {
    console.log("Error creating host:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to create host",
    };
  }
}

export async function getHost(
  id: string
): Promise<ActionResponse<HostWithAllRelations>> {
  try {
    const host = await prisma.host.findUnique({
      where: { id },
      include: HOST_INCLUDE_FULL,
    });

    if (!host) {
      return {
        ok: false,
        data: null,
        message: "Host not found",
      };
    }

    return {
      ok: true,
      data: host,
      message: "Successfully fetched host",
    };
  } catch (error) {
    console.log("Error fetching host:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to fetch host",
    };
  }
}

export async function updateHost(
  id: string,
  data: Partial<HostFormData>
): Promise<ActionResponse<Host>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    // Check access rights
    const host = await prisma.host.findFirst({
      where: {
        id,
        OR: [
          { hostUser: { some: { userId: session.user.id } } },
          { id: session.user.hostId },
        ],
      },
    });

    if (!host && session.user.role !== "admin") {
      return { ok: false, data: null, message: "Access denied" };
    }

    const hostData = {
      name: data.name,
      type: data.type,
      desc: data.desc || null,
      email: data.email || null,
      phone: data.phone || null,
      profilePic: data.profilePic || null,
      coverImg: data.coverImg || null,
      thumbnail: data.thumbnail || null,
    };

    const updatedHost = await prisma.host.update({
      where: { id },
      data: hostData,
      include: HOST_INCLUDE_FULL,
    });

    revalidatePath("/admin/host");
    revalidatePath(`/admin/host/${id}`);
    return {
      ok: true,
      data: updatedHost,
      message: "Successfully updated host",
    };
  } catch (error) {
    console.log("Error updating host:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to update host",
    };
  }
}

export async function deleteHost(id: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    // Check access rights
    const host = await prisma.host.findFirst({
      where: {
        id,
        OR: [
          { hostUser: { some: { userId: session.user.id } } },
          { id: session.user.hostId },
        ],
      },
    });

    if (!host && session.user.role !== "admin") {
      return { ok: false, data: null, message: "Access denied" };
    }

    await prisma.host.delete({ where: { id } });

    revalidatePath("/admin/host");
    return {
      ok: true,
      data: null,
      message: "Successfully deleted host",
    };
  } catch (error) {
    console.log("Error deleting host:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to delete host",
    };
  }
}

// ============================================================================
// Admin Operations
// ============================================================================

export async function getAdminPaginatedHosts(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
): Promise<ActionResponse<PaginatedResponse<HostWithBasicRelations>>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    const { skip, take } = getPaginationParams({ page, pageSize });
    const searchConditions = buildHostSearchConditions(searchTerm);

    const whereClause = {
      ...searchConditions,
      ...(session.user.role !== "admin"
        ? {
            hostUser: {
              some: { userId: session.user.id },
            },
          }
        : {}),
    };

    const [hosts, totalCount] = await Promise.all([
      prisma.host.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        include: HOST_INCLUDE_ADMIN_LIST,
      }),
      prisma.host.count({ where: whereClause }),
    ]);

    return {
      ok: true,
      data: {
        items: hosts,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
      message: "Successfully fetched hosts",
    };
  } catch (error) {
    console.log("Error fetching paginated hosts:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to fetch hosts",
    };
  }
}

// ============================================================================
// Host User Operations
// ============================================================================

export async function getCurrentHostUser(
  userId: string
): Promise<ActionResponse<HostUserWithRelations>> {
  try {
    const hostUser = await prisma.hostUser.findFirst({
      where: { userId },
      include: HOST_USER_INCLUDE_BASIC,
    });

    if (!hostUser) {
      return {
        ok: false,
        data: null,
        message: "Host user association not found",
      };
    }

    return {
      ok: true,
      data: hostUser,
      message: "Successfully fetched host user",
    };
  } catch (error) {
    console.log("Error fetching host user:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to fetch host user",
    };
  }
}

export async function upsertHostUser(
  data: HostUserFormData
): Promise<ActionResponse<HostUser>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    const hostUser = await prisma.hostUser.upsert({
      where: {
        userId_hostId: {
          userId: data.userId,
          hostId: data.hostId,
        },
      },
      update: {
        permissions: data.permissions,
        companyRole: "admin", // Hardcoded for now
      },
      create: {
        userId: data.userId,
        hostId: data.hostId,
        permissions: data.permissions,
        companyRole: "admin",
        assignedBy: data.assignedBy,
      },
    });

    revalidatePath("/admin/user");
    revalidatePath(`/admin/host/${data.hostId}`);

    return {
      ok: true,
      data: hostUser,
      message: "Successfully updated host user association",
    };
  } catch (error) {
    console.log("Error upserting host user:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        data: null,
        message: "This user-host association already exists",
      };
    }
    return {
      ok: false,
      data: null,
      message: "Failed to update host user association",
    };
  }
}

export async function removeHostUser(
  userId: string,
  hostId: string
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    await prisma.hostUser.delete({
      where: {
        userId_hostId: {
          userId,
          hostId,
        },
      },
    });

    revalidatePath("/admin/user");
    revalidatePath(`/admin/host/${hostId}`);

    return {
      ok: true,
      data: null,
      message: "Successfully removed host user association",
    };
  } catch (error) {
    console.log("Error removing host user:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to remove host user association",
    };
  }
}
