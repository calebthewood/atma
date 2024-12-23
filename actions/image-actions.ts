// actions/image-actions.ts
"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ImageDirectorySchema, ImageSchema } from "@/schemas/image-schema";
import { Image } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { deleteFromS3, S3Response, uploadToS3 } from "@/lib/s3";

import { ActionResponse } from "./shared";

/** Table of Contents
 * Types and Schemas:
 *   - ImageSchema
 *   - RecordTypeSchema
 *
 * Core Operations:
 *   - uploadImage(formData: FormData): Promise<ActionResponse<Image>>
 *   - updateImageOrder(images: ImageData[]): Promise<ActionResponse>
 *   - updateImageDescription(id: string, description: string): Promise<ActionResponse>
 *   - deleteImage(id: string): Promise<ActionResponse>
 *
 * Query Operations:
 *   - fetchImages(recordId: string, recordType: RecordType): Promise<ActionResponse<Image[]>>
 *   - getRetreatImages(retreatId: string): Promise<ActionResponse<Image[]>>
 *   - getPropertyImages(propertyId: string): Promise<ActionResponse<Image[]>>
 */

// ============================================================================
// Types and Schemas
// ============================================================================

export type ImageData = z.infer<typeof ImageSchema>;
export type RecordType = z.infer<typeof ImageDirectorySchema>;

// ============================================================================
// Core Operations
// ============================================================================

export async function uploadImage(
  formData: FormData
): Promise<ActionResponse<Image>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    const recordType = formData.get("recordType") as RecordType;
    const recordId = formData.get("recordId") as string;

    if (!file || !recordType || !recordId) {
      return { ok: false, data: null, message: "Missing required fields" };
    }

    // Step 1: Validate type and upload to S3
    try {
      const validatedType = ImageDirectorySchema.parse(recordType);
      const s3Result = await uploadToS3(file, validatedType);

      if (!s3Result.ok || !s3Result.data) {
        return { ok: false, data: null, message: s3Result.message };
      }

      // Step 2: Get current max order
      let newOrder = 0;
      try {
        const currentMaxOrder = await prisma.image.findFirst({
          where: { [`${validatedType}Id`]: recordId },
          orderBy: { order: "desc" },
          select: { order: true },
        });
        newOrder = (currentMaxOrder?.order ?? -1) + 1;
      } catch (error) {
        console.error("Error getting max order:", error);
        // Continue with default order 0
      }

      // Step 3: Create database entry
      try {
        const image = await prisma.image.create({
          data: {
            filePath: s3Result.data,
            order: newOrder,
            [`${validatedType}Id`]: recordId,
          },
        });

        revalidatePath(`/admin/${validatedType}/${recordId}/images`);
        return {
          ok: true,
          data: image,
          message: "Successfully uploaded image",
        };
      } catch (dbError) {
        console.error("Database creation error:", dbError);
        return {
          ok: false,
          data: null,
          message:
            dbError instanceof Error
              ? `Database error: ${dbError.message}`
              : "Failed to create image record",
        };
      }
    } catch (processingError) {
      console.error("Processing error:", processingError);
      return {
        ok: false,
        data: null,
        message:
          processingError instanceof Error
            ? processingError.message
            : "Failed to process image",
      };
    }
  } catch (error) {
    // Safe error logging that won't cause type errors
    if (error instanceof Error) {
      console.error("Image upload error:", error.message);
    } else {
      console.error("Unknown image upload error");
    }

    return {
      ok: false,
      data: null,
      message: "Failed to upload image",
    };
  }
}

export async function updateImageOrder(
  images: ImageData[]
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    const updates = images.map((image) =>
      prisma.image.update({
        where: { id: image.id },
        data: { order: image.order },
      })
    );

    await prisma.$transaction(updates);

    return {
      ok: true,
      data: null,
      message: "Successfully updated image order",
    };
  } catch (error) {
    console.error("Error updating image order:", error);
    return { ok: false, data: null, message: "Failed to update image order" };
  }
}

export async function updateImageDescription(
  id: string,
  description: string
): Promise<ActionResponse<Image>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    const image = await prisma.image.update({
      where: { id },
      data: { desc: description },
    });

    return {
      ok: true,
      data: image,
      message: "Successfully updated image description",
    };
  } catch (error) {
    console.error("Error updating image description:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to update image description",
    };
  }
}

export async function deleteImage(
  id: string
): Promise<ActionResponse<S3Response>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    const image = await prisma.image.findUnique({
      where: { id },
      select: { filePath: true },
    });

    if (!image) {
      return { ok: false, data: null, message: "Image not found" };
    }

    // Delete from S3
    const s3Result = await deleteFromS3(image.filePath);
    if (!s3Result.ok) {
      return { ok: false, data: s3Result, message: "Image not found" };
    }

    // Delete from database
    await prisma.image.delete({ where: { id } });

    return { ok: true, data: null, message: "Successfully deleted image" };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { ok: false, data: null, message: "Failed to delete image" };
  }
}

// ============================================================================
// Query Operations
// ============================================================================

export async function fetchImages(
  recordId: string,
  recordType: RecordType
): Promise<ActionResponse<Image[]>> {
  try {
    const images = await prisma.image.findMany({
      where: { [recordType + "Id"]: recordId },
      orderBy: { order: "asc" },
    });

    return { ok: true, data: images, message: "Successfully fetched images" };
  } catch (error) {
    console.error("Error fetching images:", error);
    return { ok: false, data: null, message: "Failed to fetch images" };
  }
}

export const getRetreatImages = cache(
  async (retreatId: string): Promise<ActionResponse<Image[]>> => {
    try {
      const retreat = await prisma.retreat.findUnique({
        where: { id: retreatId },
        select: { propertyId: true },
      });

      if (!retreat) {
        return { ok: false, data: [], message: "Retreat not found" };
      }

      const images = await prisma.image.findMany({
        where: {
          OR: [{ retreatId }, { propertyId: retreat.propertyId }],
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });

      return {
        ok: true,
        data: images,
        message: "Successfully fetched retreat images",
      };
    } catch (error) {
      console.error("Error fetching retreat images:", error);
      return { ok: false, data: [], message: "Failed to fetch retreat images" };
    }
  }
);

export const getPropertyImages = cache(
  async (propertyId: string): Promise<ActionResponse<Image[]>> => {
    try {
      const images = await prisma.image.findMany({
        where: { propertyId },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });

      return {
        ok: true,
        data: images,
        message: "Successfully fetched property images",
      };
    } catch (error) {
      console.error("Error fetching property images:", error);
      return {
        ok: false,
        data: [],
        message: "Failed to fetch property images",
      };
    }
  }
);
