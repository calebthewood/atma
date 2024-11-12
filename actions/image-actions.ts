"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Image, Retreat } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { getFileExtension } from "@/lib/utils";

const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function uploadImage(formData: FormData) {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("ERROR: Bad Environment");
  }

  const file = formData.get("file") as File;
  const recordType = formData.get("recordType") as RecordType;
  const recordId = formData.get("recordId") as string;

  if (!file || !recordType || !recordId) {
    throw new Error("Missing required fields");
  }

  const fileExtension = getFileExtension(file.name);
  const s3Filename = `${recordType}s/${uuidv4()}${fileExtension}`;

  try {
    // Upload to S3
    const imgBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(imgBuffer);

    const uploadParams = {
      Bucket: bucket,
      Key: s3Filename,
      Body: buffer,
      ContentType: file.type,
    };

    const uploadCommand = new PutObjectCommand(uploadParams);
    await s3.send(uploadCommand);

    // Create database entry
    const imageUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Filename}`;

    const currentMaxOrder = await prisma.image.findFirst({
      where: { [recordType + "Id"]: recordId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = (currentMaxOrder?.order ?? -1) + 1;

    const image = await prisma.image.create({
      data: {
        filePath: imageUrl,
        [recordType + "Id"]: recordId,
        order: newOrder,
      },
    });
    // revalidatePath(getImageRoute(image));
    return { success: true, image };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload image");
  }
}

function getImageRoute(img: Image) {
  let path = "admin/";
  if (img.programId) path += "program/" + img.programId;
  if (img.propertyId) path += "property/" + img.propertyId;
  if (img.retreatId) path += "retreat/" + img.retreatId;
  return path + "/image";
}

export type RecordType = "property" | "program" | "host" | "retreat" | "room";

const ImageSchema = z.object({
  id: z.string(),
  filePath: z.string(),
  desc: z.string().nullable(),
  order: z.number(),
});

type ImageData = z.infer<typeof ImageSchema>;

export async function fetchImages(recordId: string, recordType: RecordType) {
  try {
    const images = await prisma.image.findMany({
      where: {
        [recordType + "Id"]: recordId,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        filePath: true,
        desc: true,
        order: true,
      },
    });

    return images;
  } catch (error) {
    console.error("Error fetching images:", error);
    throw new Error("Failed to fetch images");
  }
}

export async function updateImageOrder(images: ImageData[]) {
  try {
    const updates = images.map((image) =>
      prisma.image.update({
        where: { id: image.id },
        data: { order: image.order },
      })
    );

    await prisma.$transaction(updates);
  } catch (error) {
    console.error("Error updating image order:", error);
    throw new Error("Failed to update image order");
  }
}

export async function updateImageDescription(id: string, description: string) {
  try {
    const updatedImage = await prisma.image.update({
      where: { id },
      data: { desc: description },
      select: {
        propertyId: true,
        programId: true,
        hostId: true,
        retreatId: true,
        roomId: true,
      },
    });

    return updatedImage;
  } catch (error) {
    console.error("Error updating image description:", error);
    throw new Error("Failed to update image description");
  }
}

export async function deleteImage(id: string) {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("ERROR: S3 bucket name not configured");
  }

  try {
    // First, get the image details from the database
    const image = await prisma.image.findUnique({
      where: { id },
      select: { filePath: true },
    });

    if (!image) {
      throw new Error("Image not found");
    }

    // Extract the S3 key from the URL
    // Example URL: https://bucket-name.s3.region.amazonaws.com/properties/image.jpg
    const s3Key = image.filePath.split(".com/").pop();
    if (!s3Key) {
      throw new Error("Invalid S3 URL format");
    }

    try {
      // Delete from S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: s3Key,
      });

      await s3.send(deleteCommand);
    } catch (s3Error) {
      console.error("Error deleting from S3:", s3Error);
      throw new Error("Failed to delete image from S3");
    }

    // Delete from database
    await prisma.image.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in deleteImage:", error);

    if (error instanceof Error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }

    throw new Error("Failed to delete image");
  }
}

export const getRetreatImages = cache(
  async (retreatId: string): Promise<Image[]> => {
    try {
      // First get the retreat to find its property ID
      const retreat = await prisma.retreat.findUnique({
        where: { id: retreatId },
        select: { propertyId: true },
      });

      if (!retreat) {
        return [];
      }

      // Get both retreat-specific images and property images
      const images = await prisma.image.findMany({
        where: {
          OR: [{ retreatId }, { propertyId: retreat.propertyId }],
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });

      return images;
    } catch (error) {
      console.error("Error fetching retreat images:", error);
      return [];
    }
  }
);

// Optional: If you need specific property images
export const getPropertyImages = cache(
  async (propertyId: string): Promise<Image[]> => {
    try {
      const images = await prisma.image.findMany({
        where: { propertyId },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });

      return images;
    } catch (error) {
      console.error("Error fetching property images:", error);
      return [];
    }
  }
);
