"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function createImage(data: {
  filePath: string;
  userId?: string;
  propertyId?: string;
  hostId?: string;
  retreatId?: string;
}) {
  try {
    const image = await prisma.image.create({
      data: {
        filePath: data.filePath,
        userId: data.userId,
        propertyId: data.propertyId,
        hostId: data.hostId,
        retreatId: data.retreatId,
      },
    });

    revalidatePath("/images");

    return image;
  } catch (error) {
    console.error("Error creating image:", error);
    throw new Error("Failed to create image");
  }
}

export async function getImages() {
  try {
    const images = await prisma.image.findMany();
    return images;
  } catch (error) {
    console.error("Error fetching images:", error);
    throw new Error("Failed to fetch images");
  }
}

export async function getImageById(imageId: string) {
  try {
    const image = await prisma.image.findUnique({
      where: {
        id: imageId,
      },
    });

    if (!image) {
      throw new Error("Image not found");
    }

    return image;
  } catch (error) {
    console.error(`Error fetching image with id ${imageId}:`, error);
    throw new Error(`Failed to fetch image with id ${imageId}`);
  }
}

export async function updateImage(
  imageId: string,
  data: {
    filePath?: string;
    userId?: string;
    propertyId?: string;
    hostId?: string;
    retreatId?: string;
  }
) {
  try {
    const image = await prisma.image.update({
      where: {
        id: imageId,
      },
      data,
    });

    revalidatePath(`/images/${imageId}`);

    return image;
  } catch (error) {
    console.error(`Error updating image with id ${imageId}:`, error);
    throw new Error(`Failed to update image with id ${imageId}`);
  }
}

export async function deleteImage(imageId: string) {
  try {
    const image = await prisma.image.delete({
      where: {
        id: imageId,
      },
    });

    revalidatePath("/images");

    return image;
  } catch (error) {
    console.error(`Error deleting image with id ${imageId}:`, error);
    throw new Error(`Failed to delete image with id ${imageId}`);
  }
}
