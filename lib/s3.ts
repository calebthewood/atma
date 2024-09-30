"use server"

import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
})

export const uploadToS3 = async (
  file: File,
  dir: "users" | "retreats" | "properties"
): Promise<string> => {
  const uniqueFileName = `${dir}/${Date.now()}-${file.name}`

  // Convert the file to a Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const params: PutObjectCommandInput = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: uniqueFileName,
    Body: buffer,
    ContentType: file.type,
  }

  try {
    const command = new PutObjectCommand(params)
    await s3Client.send(command)
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`
    return fileUrl
  } catch (error) {
    console.error("Error uploading to S3:", error)
    throw error
  }
}
