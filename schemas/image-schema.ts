import { z } from "zod";

export const ImageDirectorySchema = z.enum([
  "user",
  "retreat",
  "property",
  "host",
  "room",
  "program",
]);

export const ImageSchema = z.object({
  id: z.string(),
  filePath: z.string(),
  desc: z.string().nullable(),
  order: z.number(),
});
