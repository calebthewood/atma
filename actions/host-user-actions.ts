"use server";

import { HostUser, Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionResponse<T = void> = Promise<{
  success: boolean;
  data?: T | null;
  error?: string;
}>;

// Get all hosts for the select field
export async function getHosts() {
  try {
    return await prisma.host.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching hosts:", error);
    throw new Error("Failed to fetch hosts");
  }
}

// Get the user's current host association if it exists
export async function getCurrentHostUser(
  userId: string
): ActionResponse<HostUser> {
  try {
    const hostUser = await prisma.hostUser.findFirst({
      where: { userId },
      include: {
        host: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, data: hostUser };
  } catch (error) {
    console.error("Error fetching host user:", error);
    return { success: false, error: "Failed to fetch host user" };
  }
}

// Update or create the host user association

export async function upsertHostUser({
  userId,
  hostId,
  permissions,
  assignedBy,
}: {
  userId: string;
  hostId: string;
  permissions: string;
  assignedBy: string;
}): ActionResponse {
  try {
    await prisma.hostUser.upsert({
      where: {
        userId_hostId: {
          userId,
          hostId,
        },
      },
      update: {
        permissions,
        companyRole: "admin", // Hardcoded for now as specified
      },
      create: {
        userId,
        hostId,
        permissions,
        companyRole: "admin",
        assignedBy,
      },
    });

    revalidatePath("/admin/user");
    return { success: true };
  } catch (error) {
    console.error("Error upserting host user:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors (e.g., unique constraint violations)
      if (error.code === "P2002") {
        return {
          success: false,
          error: "This user-host association already exists",
        };
      }
    }
    return { success: false, error: "Failed to update host user" };
  }
}
