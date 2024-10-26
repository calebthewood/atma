"use server";

import { revalidatePath } from "next/cache";
import { PropertyFormData } from "@/schemas/property-schema";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getProperty(id: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
    });
    return property;
  } catch (error) {
    console.error("Failed to get property:", error);
    throw new Error("Failed to get property");
  }
}

export async function createProperty(data: PropertyFormData) {
  try {
    const property = await prisma.property.create({
      data: {
        ...data,
        lat: data.lat ? parseFloat(data.lat.toString()) : null,
        lng: data.lng ? parseFloat(data.lng.toString()) : null,
      },
    });
    return property;
  } catch (error) {
    console.error("Failed to create property:", error);
    throw new Error("Failed to create property");
  }
}

export async function updateProperty(
  id: string,
  data: Partial<PropertyFormData>
) {
  try {
    const property = await prisma.property.update({
      where: { id },
      data: {
        ...data,
        lat: data.lat ? parseFloat(data.lat.toString()) : undefined,
        lng: data.lng ? parseFloat(data.lng.toString()) : undefined,
      },
    });
    return property;
  } catch (error) {
    console.error("Failed to update property:", error);
    throw new Error("Failed to update property");
  }
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

export async function getProperties(): Promise<PropertiesWithImages[]> {
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

export async function getPaginatedProperties(
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.property.count(),
    ]);

    return {
      properties,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    throw new Error("Failed to fetch properties");
  }
}

function nullToUndefined<T>(obj: T): T {
  if (obj === null) {
    return undefined as any;
  }

  if (typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(nullToUndefined) as any;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, nullToUndefined(value)])
  ) as T;
}

export async function getPropertyById(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    include: {
      host: true,
      reviews: true,
      images: true,
      retreats: true,
      rooms: true,
      programs: true,
      amenities: true,
    },
  });

  return nullToUndefined(property);
}

export async function deleteProperty(id: string) {
  const property = await prisma.property.delete({
    where: { id },
  });

  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${id}`);
  return property;
}
