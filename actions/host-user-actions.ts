"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createHostUser(data: {
  userId: string;
  hostId: string;
  assignedBy: string;
}) {
  try {
    const hostUser = await prisma.hostUser.create({
      data: {
        userId: data.userId,
        hostId: data.hostId,
        assignedBy: data.assignedBy,
      },
    });

    revalidatePath("/hostUsers");

    return hostUser;
  } catch (error) {
    console.error("Error creating hostUser:", error);
    throw new Error("Failed to create hostUser");
  }
}

export async function getHostUsers() {
  try {
    const hostUsers = await prisma.hostUser.findMany();
    return hostUsers;
  } catch (error) {
    console.error("Error fetching hostUsers:", error);
    throw new Error("Failed to fetch hostUsers");
  }
}

export async function getHostUserById(userId: string, hostId: string) {
  try {
    const hostUser = await prisma.hostUser.findUnique({
      where: {
        userId_hostId: {
          userId,
          hostId,
        },
      },
    });

    if (!hostUser) {
      throw new Error("HostUser not found");
    }

    return hostUser;
  } catch (error) {
    console.error(`Error fetching hostUser with userId ${userId} and hostId ${hostId}:`, error);
    throw new Error(`Failed to fetch hostUser with userId ${userId} and hostId ${hostId}`);
  }
}


export async function updateHostUser(userId: string, hostId: string, data: {
  assignedBy?: string;
}) {
  try {
    const hostUser = await prisma.hostUser.update({
      where: {
        userId_hostId: {
          userId,
          hostId,
        },
      },
      data,
    });

    revalidatePath(`/hostUsers/${userId}/${hostId}`);

    return hostUser;
  } catch (error) {
    console.error(`Error updating hostUser with userId ${userId} and hostId ${hostId}:`, error);
    throw new Error(`Failed to update hostUser with userId ${userId} and hostId ${hostId}`);
  }
}

export async function deleteHostUser(userId: string, hostId: string) {
  try {
    const hostUser = await prisma.hostUser.delete({
      where: {
        userId_hostId: {
          userId,
          hostId,
        },
      },
    });

    revalidatePath("/hostUsers");

    return hostUser;
  } catch (error) {
    console.error(`Error deleting hostUser with userId ${userId} and hostId ${hostId}:`, error);
    throw new Error(`Failed to delete hostUser with userId ${userId} and hostId ${hostId}`);
  }
}