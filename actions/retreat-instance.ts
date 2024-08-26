"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

import { prisma } from "@/lib/prisma";

export async function getRetreatInstance(id: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  return prisma.retreatInstance.findUnique({
    where: { id },
    include: { retreat: true, Bookings: true, priceMods: true },
  });
}

export async function getRetreatInstances() {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  return prisma.retreatInstance.findMany({
    include: { retreat: true, Bookings: true, priceMods: true },
  });
}

export async function updateRetreatInstance(
  id: string,
  data: {
    startDate?: Date;
    endDate?: Date;
    availableSlots?: number;
    isFull?: boolean;
  }
) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const updatedInstance = await prisma.retreatInstance.update({
    where: { id },
    data,
  });

  revalidatePath("/retreats");
  return updatedInstance;
}

export async function createRetreatInstance(data: {
  retreatId: string;
  startDate: Date;
  endDate: Date;
  availableSlots: number;
}) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const newInstance = await prisma.retreatInstance.create({
    data: {
      ...data,
      isFull: false,
    },
  });

  revalidatePath("/retreats");
  return newInstance;
}

export async function deleteRetreatInstance(id: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await prisma.retreatInstance.delete({
    where: { id },
  });

  revalidatePath("/retreats");
}
