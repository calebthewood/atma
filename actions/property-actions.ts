"use server";

import { revalidatePath } from "next/cache";
import { Prisma, Property } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function createProperty(data: Property) {
  const property = await prisma.property.create({
    data: {
      ...data,
    },
  });

  revalidatePath("/properties");

  return property;
}

export type PropertiesWithImages = Prisma.PropertyGetPayload<{
  include: {
    host: {
      select: {
        name: true;
        id: true;
      };
    };
    images: true;
  };
}>;

export async function getProperties() {
  const properties = await prisma.property.findMany({
    include: {
      host: {
        select: {
          name: true,
          id: true,
        },
      },
      images: true,
    },
  });
  return properties;
}

export async function getPropertyById(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    include: {
      images: true,
    },
  });

  return property;
}

export async function updateProperty(propertyId: string, data: Property) {
  const property = await prisma.property.update({
    where: {
      id: propertyId,
    },
    data,
  });

  revalidatePath(`/properties/${propertyId}`);

  return property;
}

export async function deleteProperty(propertyId: string) {
  const property = await prisma.property.delete({
    where: {
      id: propertyId,
    },
  });

  revalidatePath("/properties");

  return property;
}
