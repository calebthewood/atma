"use server";

import { revalidatePath } from "next/cache";
import { Host, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function createHost(data: Host): Promise<Host> {
  try {
    const host = await prisma.host.create({
      data: {
        ...data,
      },
    });

    revalidatePath("/hosts");

    return host;
  } catch (error) {
    console.error("Error creating host:", error);
    throw new Error("Failed to create host");
  }
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

export async function getHostById(hostId: string): Promise<Host> {
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

    revalidatePath(`/host/${hostId}`);

    return host;
  } catch (error) {
    console.error(`Error updating host with id ${hostId}:`, error);
    throw new Error(`Failed to update host with id ${hostId}`);
  }
}

export async function deleteHost(hostId: string): Promise<Host> {
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
