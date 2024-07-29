"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProperty(data: {
  email: string;
  phone: string;
  name: string;
  description: string;
  address: string;
  closestAirport: string;
  location: string;
  type: string;
  amenities: string;
  rating: string;
  hostId: string;
}) {
  const property = await prisma.property.create({
    data: {
      email: data.email,
      phone: data.phone,
      name: data.name,
      description: data.description,
      address: data.address,
      closestAirport: data.closestAirport,
      location: data.location,
      type: data.type,
      amenities: data.amenities,
      rating: data.rating,
      hostId: data.hostId,
    },
  });

  revalidatePath("/properties");

  return property;
}

export async function getProperties() {
  const properties = await prisma.property.findMany({
    include: {
      host: {
        select: {
          name: true,
          id: true
        },
      },
    },
  });
  return properties;
}

export async function getPropertyById(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
  });

  return property;
}

export async function updateProperty(propertyId: string, data: {
  email?: string;
  phone?: string;
  name?: string;
  description?: string;
  address?: string;
  closestAirport?: string;
  location?: string;
  type?: string;
  amenities?: string;
  rating?: string;
  hostId?: string;
}) {
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