// actions/auth-actions.ts
"use server";

import { auth, signIn } from "@/auth";
import { AuthErrorCode } from "@/schemas/auth-schema";
import { User } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";

import { ActionResponse } from "./shared";

/** ToC
 * Types:
 *   - AuthErrorCode type
 *   - AuthErrorDetails type
 *
 * Authentication Operations:
 *   - googleSignIn(): Promise<ActionResponse>
 *   - getAuthenticatedUser(): Promise<ActionResponse<User>>
 *   - sendgridSignIn(formData): Void
 */

// ============================================================================
// Types
// ============================================================================

export type AuthErrorCode = z.infer<typeof AuthErrorCode>;

export type AuthErrorDetails = {
  code: AuthErrorCode;
  details?: unknown;
};

// ============================================================================
// Authentication Operations
// ============================================================================

/**
 * Initiates Google OAuth sign-in.
 *  won't work in a try-catch block,
 *  won't work (currently) with redirect
 */
export async function googleSignIn() {
  await signIn("google", { redirectTo: "/" });
}
/**
 * Initiates Sendgrid Magic Link sign-in
 *  Note that sendgrid and google auth handle the rediorect differently
 */

const SignInSchema = z.object({
  email: z.string().email(),
});

export async function sendgridSignIn(formData: FormData) {
  const email = formData.get("email");
  const result = SignInSchema.safeParse({ email });

  if (!result.success) {
    return { error: "Invalid email address" };
  }

  try {
    await signIn("sendgrid", {
      email: result.data.email,
      redirect: false,
      redirectTo: "/",
    });
    return { success: true };
  } catch (error) {
    console.log(error);
    return { error: "Failed to send login email" };
  }
}

/**
 * Retrieves the currently authenticated user with full details
 * @returns ActionResponse containing User data if authenticated
 */
export async function getAuthenticatedUser(): Promise<ActionResponse<User>> {
  try {
    const session = await auth();

    // Check for authenticated session
    if (!session?.user?.email) {
      return {
        ok: false,
        data: null,
        message: "Not authenticated",
      };
    }

    // Fetch user details from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return {
        ok: false,
        data: null,
        message: "User not found in database",
      };
    }

    return {
      ok: true,
      data: user,
      message: "User retrieved successfully",
    };
  } catch (error) {
    console.log("Error getting authenticated user:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to get authenticated user",
    };
  }
}

/**
 * Validates the authentication state and returns minimal user data
 * Useful for quick auth checks in protected routes
 */
export async function validateAuth(): Promise<
  ActionResponse<{ id: string; role: string }>
> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        ok: false,
        data: null,
        message: "Not authenticated",
      };
    }

    return {
      ok: true,
      data: {
        id: session.user.id,
        role: session.user.role,
      },
      message: "User is authenticated",
    };
  } catch (error) {
    console.log("Error validating authentication:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to validate authentication",
    };
  }
}

/**
 * Helper to check if a user has required role
 * @param requiredRole The role required for access
 */
export async function checkUserRole(
  requiredRole: "admin" | "host" | "user"
): Promise<ActionResponse<boolean>> {
  try {
    const session = await auth();

    if (!session?.user?.role) {
      return {
        ok: false,
        data: false,
        message: "Not authenticated",
      };
    }

    // Admin has access to everything
    if (session.user.role === "admin") {
      return {
        ok: true,
        data: true,
        message: "User has required role",
      };
    }

    // For host or user roles, check exact match
    const hasRole = session.user.role === requiredRole;

    return {
      ok: true,
      data: hasRole,
      message: hasRole
        ? "User has required role"
        : "User does not have required role",
    };
  } catch (error) {
    console.log("Error checking user role:", error);
    return {
      ok: false,
      data: false,
      message: "Failed to check user role",
    };
  }
}

/**
 * Helper to ensure user has access to a specific host
 * @param hostId The host ID to check access for
 */
export async function validateHostAccess(
  hostId: string
): Promise<ActionResponse<boolean>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        ok: false,
        data: false,
        message: "Not authenticated",
      };
    }

    // Admins have access to all hosts
    if (session.user.role === "admin") {
      return {
        ok: true,
        data: true,
        message: "Admin has access to all hosts",
      };
    }

    // Check if user is associated with this host
    const hostUser = await prisma.hostUser.findUnique({
      where: {
        userId_hostId: {
          userId: session.user.id,
          hostId,
        },
      },
    });

    return {
      ok: true,
      data: !!hostUser,
      message: hostUser
        ? "User has host access"
        : "User does not have host access",
    };
  } catch (error) {
    console.log("Error validating host access:", error);
    return {
      ok: false,
      data: false,
      message: "Failed to validate host access",
    };
  }
}
