"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";



import { prisma } from "@/lib/prisma";





export async function createHost(data: {
  name: string
  type: string
  description: string
  email: string
  phone: string
  profilePic: string
  userId?: string
}) {
  try {
    const host = await prisma.host.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        email: data.email,
        phone: data.phone,
        profilePic: data.profilePic,
        userId: data.userId,
      },
    })

    revalidatePath("/hosts")

    return host
  } catch (error) {
    console.error("Error creating host:", error)
    throw new Error("Failed to create host")
  }
}

// Define the type for the query result
export type HostWithImages = Prisma.HostGetPayload<{
  include: {
    images: {
      select: {
        filePath: true
        description: true
      }
    }
  }
}>

// Define the Prisma query arguments type
const hostWithImagesArgs = Prisma.validator<Prisma.HostDefaultArgs>()({
  include: {
    images: {
      select: {
        filePath: true,
        description: true,
      },
    },
  },
})

// Define the return type of the getHosts function
type GetHostsReturn = HostWithImages[]

export async function getHosts(): Promise<GetHostsReturn> {
  try {
    const hosts = await prisma.host.findMany(hostWithImagesArgs)
    return hosts
  } catch (error) {
    console.error("Error fetching hosts:", error)
    throw new Error("Failed to fetch hosts")
  }
}

export async function getHostById(hostId: string) {
  try {
    const host = await prisma.host.findUnique({
      where: {
        id: hostId,
      },
    });

    if (!host) {
      throw new Error("Host not found");
    }

    return host;
  } catch (error) {
    console.error(`Error fetching host with id ${hostId}:`, error);
    throw new Error(`Failed to fetch host with id ${hostId}`);
  }
}

export async function updateHost(
  hostId: string,
  data: {
    name?: string;
    type?: string;
    description?: string;
    email?: string;
    phone?: string;
    profilePic?: string;
    userId?: string;
  }
) {
  try {
    const host = await prisma.host.update({
      where: {
        id: hostId,
      },
      data,
    });

    revalidatePath(`/hosts/${hostId}`);

    return host;
  } catch (error) {
    console.error(`Error updating host with id ${hostId}:`, error);
    throw new Error(`Failed to update host with id ${hostId}`);
  }
}

export async function deleteHost(hostId: string) {
  try {
    const host = await prisma.host.delete({
      where: {
        id: hostId,
      },
    });

    revalidatePath("/hosts");

    return host;
  } catch (error) {
    console.error(`Error deleting host with id ${hostId}:`, error);
    throw new Error(`Failed to delete host with id ${hostId}`);
  }
}