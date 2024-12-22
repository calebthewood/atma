// app/actions/host-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { hostFormSchema } from "@/schemas/host-schema";
import { Host, Prisma } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";

import { getAuthenticatedUser } from "./auth-actions";

// Types
export type HostWithBasicRelations = Prisma.HostGetPayload<{
  include: {
    hostUser: { include: { user: true } };
    images: true;
  };
}>;

export type PaginatedHostsResponse = {
  hosts: HostWithBasicRelations[];
  totalPages: number;
  currentPage: number;
};

export type ActionResponse<T = void> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
}>;

export type HostFormData = z.infer<typeof hostFormSchema>;

// Get paginated hosts with auth check
export async function getPaginatedHosts(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
): ActionResponse<PaginatedHostsResponse> {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.data) return { success: false, error: "Unauthorized" };

    const skip = (page - 1) * pageSize;
    const where: Prisma.HostWhereInput = {
      ...buildSearchFilter(searchTerm),
      // If not admin, only show hosts user has access to
      ...(user.data.role !== "admin" && {
        hostUser: {
          some: { userId: user.data.id },
        },
      }),
    };

    const [hosts, totalCount] = await Promise.all([
      prisma.host.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
        include: {
          hostUser: { include: { user: true } },
          images: true,
        },
      }),
      prisma.host.count({ where }),
    ]);

    return {
      success: true,
      data: {
        hosts,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated hosts:", error);
    return { success: false, error: "Failed to fetch hosts" };
  }
}

// Helper for search
function buildSearchFilter(searchTerm: string): Prisma.HostWhereInput {
  return searchTerm
    ? {
        OR: [
          { name: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { phone: { contains: searchTerm } },
        ],
      }
    : {};
}
const hostWithImagesArgs = {
  include: {
    images: {
      select: {
        filePath: true,
        desc: true,
      },
    },
  },
} as const;

export type HostWithImages = Prisma.HostGetPayload<typeof hostWithImagesArgs>;

export type GetHostsReturn = HostWithImages[];

export type ImageType = {
  filePath: string;
  desc: string | null;
};

export type HostWithImagesStandalone = Prisma.HostGetPayload<
  typeof hostWithImagesArgs
> & {
  images: ImageType[];
};
export async function getHosts(): Promise<GetHostsReturn> {
  try {
    const hosts = await prisma.host.findMany(hostWithImagesArgs);
    return hosts;
  } catch (error) {
    console.error("Error fetching hosts:", error);
    throw new Error("Failed to fetch hosts");
  }
}

export async function upsertHost(
  id: string | undefined,
  data: HostFormData
): ActionResponse<Host> {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.data) return { success: false, error: "Unauthorized" };

    // Clean up the data to match Prisma's expectations
    const hostData = {
      name: data.name,
      type: data.type,
      desc: data.desc || null,
      email: data.email || null,
      phone: data.phone || null,
      profilePic: data.profilePic || null,
      coverImg: data.coverImg || null,
      thumbnail: data.thumbnail || null,
      userId: data.userId || null,
      verified: data.verified || null,
    };

    if (id) {
      // Update existing host
      const host = await prisma.host.update({
        where: { id },
        data: hostData,
      });

      revalidatePath("/admin/host");
      return { success: true, data: host };
    } else {
      // Create new host
      const host = await prisma.host.create({
        data: {
          ...hostData,
          hostUser: {
            create: {
              userId: user.data.id,
              permissions: "crud",
              assignedBy: user.data.id,
            },
          },
        },
      });

      revalidatePath("/admin/host");
      return { success: true, data: host };
    }
  } catch (error) {
    console.error("Error upserting host:", error);
    return { success: false, error: "Failed to save host" };
  }
}

export async function getHost(id: string) {
  const res = await prisma.host.findFirst({ where: { id } });
  return res;
}

export async function handleDelete(id: string) {
  const res = await prisma.host.delete({ where: { id } });
  return res;
}
