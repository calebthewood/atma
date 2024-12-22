"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { PropertyFormData } from "@/schemas/property-schema";
import { Prisma, Property } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { ActionResponse } from "./program-actions";

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

export type PropertyWithRelations = Prisma.PropertyGetPayload<{
  include: {
    images: true;
    retreats: true;
    programs: true;
    amenities: true;
    priceMods: true;
  };
}>;

export type GetPropertyResponse =
  | {
      success: true;
      property: PropertyWithRelations;
    }
  | {
      success: false;
      error: string;
    };

export type GetPaginatedPropertiesResponse =
  | {
      success: true;
      properties: PropertyWithRelations[];
      totalPages: number;
      currentPage: number;
      totalProperties: number;
    }
  | {
      success: false;
      error: string;
    };

// Type for property search/filter parameters
export type PropertyFilterParams = {
  search?: string;
  hostId?: string;
  verified?: boolean;
  type?: string;
  country?: string;
  minRating?: number;
  amenities?: string[];
};

// Main actions
export async function getPropertyWithId(
  id: string
): Promise<GetPropertyResponse> {
  try {
    const property = await prisma.property.findUnique({
      where: { id, status: "published" },
      include: {
        host: true,
        amenities: true,
        images: {
          orderBy: {
            order: "asc",
          },
        },
        rooms: true,
        retreats: true,
        programs: true,
        priceMods: true,
      },
    });

    if (!property) {
      return {
        success: false,
        error: "Property not found",
      };
    }

    return {
      success: true,
      property,
    };
  } catch (error) {
    console.error("Error fetching property:", error);
    return {
      success: false,
      error: "Failed to fetch property",
    };
  }
}
export async function createProperty(
  data: PropertyFormData
): ActionResponse<Property> {
  try {
    const { hostId, ...restData } = data;

    const createData: Prisma.PropertyCreateInput = {
      ...restData,
      lat: restData.lat ? parseFloat(restData.lat.toString()) : null,
      lng: restData.lng ? parseFloat(restData.lng.toString()) : null,
      host: {
        connect: { id: hostId || "" }, // Since host is required, we'll let Prisma throw if hostId is invalid
      },
    };

    const property = await prisma.property.create({
      data: createData,
    });

    revalidatePath("/admin/property");
    return { success: true, data: property };
  } catch (error) {
    console.error("Failed to create property:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create property. Host is required.",
    };
  }
}

export async function updateProperty(
  id: string,
  data: Partial<PropertyFormData>
): ActionResponse<Property> {
  try {
    const { hostId, ...restData } = data;

    const updateData: Prisma.PropertyUpdateInput = {
      ...restData,
      ...(restData.lat !== undefined
        ? {
            lat: restData.lat ? parseFloat(restData.lat.toString()) : null,
          }
        : {}),
      ...(restData.lng !== undefined
        ? {
            lng: restData.lng ? parseFloat(restData.lng.toString()) : null,
          }
        : {}),
      ...(hostId !== undefined
        ? {
            host: {
              connect: { id: hostId }, // Since host is required, we'll let Prisma throw if hostId is invalid
            },
          }
        : {}),
    };

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/property");
    revalidatePath(`/admin/property/${id}`);
    return { success: true, data: property };
  } catch (error) {
    console.error("Failed to update property:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update property",
    };
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
    where: { status: "published" },
    include: {
      host: {
        select: {
          name: true,
          id: true,
        },
      },
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
  return properties;
}

export type PropertyWithHostAndImages = Prisma.PropertyGetPayload<{
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

export async function getAdminProperties(): Promise<{
  success: boolean;
  data?: PropertyWithHostAndImages[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // If user is admin, return all properties
    if (session.user.role === "admin") {
      const properties = await prisma.property.findMany({
        where: { status: "published" },
        include: {
          host: {
            select: {
              name: true,
              id: true,
            },
          },
          images: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
      return { success: true, data: properties };
    }

    // For host users, return only their properties using hostId from session
    const properties = await prisma.property.findMany({
      where: {
        status: "published",
        hostId: session.user.hostId,
      },
      include: {
        host: {
          select: {
            name: true,
            id: true,
          },
        },
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return { success: true, data: properties };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch properties",
    };
  }
}

export async function getPropertyIds() {
  const properties = await prisma.property.findMany({
    where: {
      status: "published",
    },
    select: {
      id: true,
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

export async function getPropertyById(
  propertyId: string
): Promise<PropertyWithRelations | null> {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    include: {
      images: {
        orderBy: {
          order: "asc",
        },
      },
      retreats: true,
      programs: true,
      amenities: true,
      priceMods: true,
    },
  });

  return property;
}

export async function deleteProperty(id: string) {
  const property = await prisma.property.delete({
    where: { id },
  });

  revalidatePath("/admin/property");
  revalidatePath(`/admin/property/${id}`);
  return property;
}

export type PropertyAmenityWithDetails = {
  propertyId: string;
  amenityId: string;
  createdAt: Date;
  updatedAt: Date;
  amenity: {
    id: string;
    type: string;
    categoryValue: string | null;
    categoryName: string | null;
    name: string;
    value: string;
    custom: boolean;
  };
};

export async function getAdminPaginatedProperties(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
): Promise<{
  success: boolean;
  data?: {
    properties: Property[];
    totalPages: number;
    currentPage: number;
  };
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const skip = (page - 1) * pageSize;

    // Base search conditions
    const searchConditions = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm } },
            { city: { contains: searchTerm } },
            { country: { contains: searchTerm } },
          ],
        }
      : {};

    // Build where clause based on role
    const whereClause = {
      ...searchConditions,
      ...(session.user.role !== "admin" ? { hostId: session.user.hostId } : {}),
    };

    // Execute queries in parallel for efficiency
    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          host: {
            select: {
              name: true,
              id: true,
            },
          },
          images: {
            take: 1,
            orderBy: {
              order: "asc",
            },
          },
        },
      }),
      prisma.property.count({
        where: whereClause,
      }),
    ]);

    return {
      success: true,
      data: {
        properties,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Failed to fetch paginated properties:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch properties",
    };
  }
}

export async function getPropertyAmenities(
  propertyId: string
): Promise<PropertyAmenityWithDetails[]> {
  try {
    const amenities = await prisma.propertyAmenity.findMany({
      where: {
        propertyId: propertyId,
      },
      include: {
        amenity: true,
      },
      orderBy: [
        {
          amenity: {
            type: "asc",
          },
        },
        {
          amenity: {
            categoryValue: "asc",
          },
        },
        {
          amenity: {
            name: "asc",
          },
        },
      ],
    });

    return amenities;
  } catch (error) {
    console.error("Failed to fetch property amenities:", error);
    throw new Error("Failed to fetch property amenities");
  }
}

// Optional: Helper function to get amenities by category
export async function getPropertyAmenitiesByCategory(
  propertyId: string,
  category: string
): Promise<PropertyAmenityWithDetails[]> {
  try {
    const amenities = await prisma.propertyAmenity.findMany({
      where: {
        propertyId: propertyId,
        amenity: {
          categoryValue: category,
        },
      },
      include: {
        amenity: true,
      },
      orderBy: {
        amenity: {
          name: "asc",
        },
      },
    });

    return amenities;
  } catch (error) {
    console.error(
      `Failed to fetch property amenities for category ${category}:`,
      error
    );
    throw new Error(
      `Failed to fetch property amenities for category ${category}`
    );
  }
}

export type EntityWithDetails = {
  id: string;
  name: string | null;
  images: { filePath: string }[];
  city?: string | null;
  country?: string | null;
  date?: Date | null;
  endDate?: Date | null;
  priceMods: {
    type: string;
    value: number;
  }[];
};

export async function getPropertyEntityIds(
  propertyId: string,
  entityType: "retreat" | "program"
) {
  try {
    if (entityType === "retreat") {
      const retreats = await prisma.retreat.findMany({
        where: {
          propertyId,
          status: "published",
        },
        take: 10,
        orderBy: {
          date: "asc",
        },
        select: {
          id: true,
        },
      });
      return retreats.map((r) => r?.id);
    } else {
      const programs = await prisma.program.findMany({
        where: {
          propertyId,
          status: "published",
        },
        take: 10,
        orderBy: {
          date: "asc",
        },
        select: {
          id: true,
        },
      });
      return programs.map((p) => p?.id);
    }
  } catch (error) {
    console.error(`Failed to fetch ${entityType} IDs:`, error);
    throw new Error(`Failed to fetch ${entityType} IDs`);
  }
}
