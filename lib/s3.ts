// lib/s3.ts
"use server";

import { ImageDirectorySchema } from "@/schemas/image-schema";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

// ============================================================================
// Types and Validation
// ============================================================================

export type ImageDirectory = z.infer<typeof ImageDirectorySchema>;

export type S3Response<T = void> = {
  ok: boolean;
  data: T | null;
  message: string;
};

// ============================================================================
// Client Configuration
// ============================================================================

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// ============================================================================
// Helper Functions
// ============================================================================

function validateEnvironment(): S3Response {
  if (!BUCKET_NAME) {
    return { ok: false, data: null, message: "S3 bucket name not configured" };
  }
  if (!process.env.AWS_REGION) {
    return { ok: false, data: null, message: "AWS region not configured" };
  }
  return { ok: true, data: null, message: "Environment validated" };
}

function getS3KeyFromUrl(url: string): string | null {
  try {
    return url.split(".com/").pop() || null;
  } catch {
    return null;
  }
}

// ============================================================================
// Core Operations
// ============================================================================

/**
 * Uploads a file to S3 and returns the public URL
 */
export async function uploadToS3(
  file: File,
  directory: ImageDirectory
): Promise<S3Response<string>> {
  const envCheck = validateEnvironment();
  if (!envCheck.ok) return envCheck as S3Response<string>;

  try {
    const uniqueFileName = `${directory}/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const params: PutObjectCommandInput = {
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: buffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

    return {
      ok: true,
      data: fileUrl,
      message: "Successfully uploaded file",
    };
  } catch (error) {
    console.log("Error uploading to S3:", error);
    return {
      ok: false,
      data: null,
      message: error instanceof Error ? error.message : "Failed to upload file",
    };
  }
}

/**
 * Gets a signed URL for temporary access to a private S3 object
 */
export async function getSignedImageUrl(
  key: string,
  expiresIn: number = 3600
): Promise<S3Response<string>> {
  const envCheck = validateEnvironment();
  if (!envCheck.ok) return envCheck as S3Response<string>;

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return {
      ok: true,
      data: url,
      message: "Successfully generated signed URL",
    };
  } catch (error) {
    console.log("Error generating signed URL:", error);
    return {
      ok: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate signed URL",
    };
  }
}

/**
 * Deletes a file from S3
 */
export async function deleteFromS3(url: string): Promise<S3Response> {
  const envCheck = validateEnvironment();
  if (!envCheck.ok) return envCheck;

  const s3Key = getS3KeyFromUrl(url);
  if (!s3Key) {
    return { ok: false, data: null, message: "Invalid S3 URL format" };
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(command);

    return {
      ok: true,
      data: null,
      message: "Successfully deleted file",
    };
  } catch (error) {
    console.log("Error deleting from S3:", error);
    return {
      ok: false,
      data: null,
      message: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
}
