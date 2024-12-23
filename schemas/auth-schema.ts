import { z } from "zod";

export const AuthErrorCode = z.enum([
  "UNAUTHORIZED",
  "USER_NOT_FOUND",
  "DATABASE_ERROR",
  "INVALID_PROVIDER",
]);
