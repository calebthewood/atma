"use server";

import { auth, signIn } from "@/auth.ts";
import { User } from "@prisma/client";

import prisma from "@/lib/prisma";

export async function googleSignIn(): Promise<void> {
  await signIn("google", {
    provider: "google",
    redirectTo: "/",
    redirect: true,
  });
}

type AuthResponse = {
  ok: boolean;
  message: string;
  data: User | null;
  error?: {
    code: "UNAUTHORIZED" | "DATABASE_ERROR";
    details?: unknown;
  };
};

export async function getAuthenticatedUser(): Promise<AuthResponse> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        ok: false,
        message: "Not authenticated",
        data: null,
        error: {
          code: "UNAUTHORIZED",
        },
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return {
        ok: false,
        message: "User not found",
        data: null,
        error: {
          code: "UNAUTHORIZED",
        },
      };
    }

    return {
      ok: true,
      message: "User retrieved successfully",
      data: user,
    };
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return {
      ok: false,
      message: "Failed to get authenticated user",
      data: null,
      error: {
        code: "DATABASE_ERROR",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
    };
  }
}
