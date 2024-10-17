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
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          type: true,
          rating: true,
          verified: true,
          createdAt: true,
          updatedAt: true,
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

// Define a type that includes all optional fields from the Property model
type PropertyUpdateInput = Partial<
  Omit<Prisma.PropertyUpdateInput, "id" | "createdAt" | "updatedAt">
>;

export async function updateProperty(
  propertyId: string,
  data: PropertyUpdateInput
) {
  try {
    // Remove any undefined values to avoid Prisma errors
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        //@ts-ignore
        acc[key] = value;
      }
      return acc;
    }, {} as PropertyUpdateInput);

    const property = await prisma.property.update({
      where: {
        id: propertyId,
      },
      data: cleanedData,
    });

    revalidatePath(`/admin/property/${propertyId}`);

    return property;
  } catch (error) {
    console.error("Failed to update property:", error);
    throw new Error("Failed to update property");
  }
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
