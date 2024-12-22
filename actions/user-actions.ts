"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { HostUser, Prisma, User } from "@prisma/client";
import { z } from "zod";

import { ActionResponse } from "@/types/shared";
import { errorPayloads } from "@/config/site";
import { prisma } from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";

import { getAuthenticatedUser } from "./auth-actions";
import { canViewDashboard } from "@/lib/checks-and-balances";

type CreateUserInput = {
  fname?: string;
  lname?: string;
  username?: string;
  email?: string;
  phone?: string;
  role: "user" | "host" | "admin";
  status: "active" | "inactive" | "suspended" | "deleted" | "archived";
  image?: string;
  hostUsers?: {
    hostId: string;
    permissions: string;
    companyRole: string;
  }[];
};

export async function createUser(
  data: CreateUserInput
): Promise<ActionResponse<UserFormData>> {
  try {
    // Check authentication
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

    // Verify admin privileges
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || currentUser.role !== "admin") {
      return {
        ok: false,
        message: "Not authorized to create users",
        data: null,
        error: {
          code: "FORBIDDEN",
        },
      };
    }

    // Start a transaction to handle user and host relationships
    const user = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          fname: data.fname,
          lname: data.lname,
          name: data.fname || "" + " " + data.lname || "",
          username: data.username,
          email: data.email,
          phone: data.phone,
          role: data.role,
          status: data.status,
          image: data.image,
        },
      });

      // Create host associations if provided
      if (data.hostUsers?.length) {
        await tx.hostUser.createMany({
          data: data.hostUsers.map((hu) => ({
            userId: newUser.id,
            hostId: hu.hostId,
            permissions: hu.permissions,
            companyRole: hu.companyRole,
            assignedBy: currentUser.id,
          })),
        });
      }

      // Return user with host relationships
      return tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          hostUsers: {
            select: {
              hostId: true,
              permissions: true,
              companyRole: true,
            },
          },
        },
      });
    });

    if (!user) {
      return {
        ok: false,
        message: "Failed to create user",
        data: null,
        error: {
          code: "CREATE_ERROR",
        },
      };
    }

    // Transform to UserFormData type
    const formData: UserFormData = {
      role: user.role as "user" | "host" | "admin",
      name: user.name,
      status: user.status as
        | "active"
        | "inactive"
        | "suspended"
        | "deleted"
        | "archived",
      image: user.image ?? undefined,
      fname: user.fname ?? undefined,
      lname: user.lname ?? undefined,
      username: user.username ?? undefined,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      hostUsers: user.hostUsers,
    };

    return {
      ok: true,
      message: "User created successfully",
      data: formData,
    };
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violations
      if (error.code === "P2002") {
        const target = error.meta?.target as string[];
        return {
          ok: false,
          message: `${target?.[0]} already exists`,
          data: null,
          error: {
            code: "UNIQUE_CONSTRAINT",
            details: target,
          },
        };
      }
    }
    return {
      ok: false,
      message: "Failed to create user",
      data: null,
      error: {
        code: "DATABASE_ERROR",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
    };
  }
}

// Include the relations we need for the table
export type UserWithRelations = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  status: string;
  updatedAt: Date;
  hostUsers: {
    hostId: string;
    permissions: string;
    companyRole: string;
  }[];
};

// Input validation schemas
const updateRoleSchema = z.object({
  role: z.enum(["user", "host", "admin"]),
});

const updateStatusSchema = z.object({
  status: z.enum(["active", "inactive", "suspended", "deleted", "archived"]),
});

export async function getPaginatedUsers(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
): Promise<ActionResponse<{ users: any[]; totalPages: number }>> {
  try {
    // Check if user is authenticated
    const authResponse = await getAuthenticatedUser();

    if (!authResponse.ok || !authResponse.data) {
      return {
        ok: false,
        data: null,
        message: "Not authenticated",
        error: { code: "UNAUTHORIZED" },
      };
    }

    const authenticatedUser = authResponse.data;

    // Only allow admin and host roles
    if (!canViewDashboard(authenticatedUser.role)) {
      return {
        ok: false,
        data: null,
        message: "Not authorized",
        error: { code: "FORBIDDEN" },
      };
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Build base search conditions
    const baseWhere: Prisma.UserWhereInput = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm } },
            { email: { contains: searchTerm } },
          ],
        }
      : {};

    // If user is a host, add host-specific filtering
    if (authenticatedUser.role === "host") {
      const userHosts = await prisma.hostUser.findMany({
        where: { userId: authenticatedUser.id },
        select: { hostId: true },
      });

      const hostIds = userHosts.map((uh) => uh.hostId);

      // Combine search and host filtering
      Object.assign(baseWhere, {
        hostUsers: {
          some: {
            hostId: { in: hostIds },
          },
        },
      });
    }

    // Get users with count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: baseWhere,
        include: {
          hostUsers: {
            include: {
              host: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.user.count({ where: baseWhere }),
    ]);

    return {
      ok: true,
      data: {
        users,
        totalPages: Math.ceil(total / pageSize),
      },
      message: "Users retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to fetch users",
      error: {
        code: "DATABASE_ERROR",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
    };
  }
}

export async function updateUserRole(
  userId: string,
  role: string
): Promise<ActionResponse> {
  try {
    // Validate input
    const { role: validatedRole } = updateRoleSchema.parse({ role });

    // Check authorization
    const session = await auth();
    if (!session?.user?.email) {
      return errorPayloads.notFound;
    }
    const currentUser = await prisma.user.findUnique({
      where: { email: session?.user?.email },
    });

    if (!currentUser || currentUser.role !== "admin") {
      return {
        ok: false,
        data: null,
        message: "Not authorized to update user roles",
        error: { code: "FORBIDDEN" },
      };
    }

    // Update the user
    await prisma.user.update({
      where: { id: userId },
      data: { role: validatedRole },
    });

    return {
      ok: true,
      message: "User role updated successfully",
      data: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        data: null,
        message: "Invalid role provided",
        error: {
          code: "VALIDATION_ERROR",
          details: error.errors,
        },
      };
    }

    return {
      ok: false,
      data: null,
      message: "Failed to update user role",
      error: {
        code: "DATABASE_ERROR",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
    };
  }
}

export async function updateUserStatus(
  userId: string,
  status: string
): Promise<ActionResponse> {
  try {
    // Validate input
    const { status: validatedStatus } = updateStatusSchema.parse({ status });

    const session = await auth();
    if (!session?.user?.email) {
      return errorPayloads.notAuth;
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session?.user?.email },
    });

    if (!currentUser || currentUser.role !== "admin") {
      return {
        ok: false,
        data: null,
        message: "Not authorized to update user status",
        error: { code: "FORBIDDEN" },
      };
    }

    // Update the user
    await prisma.user.update({
      where: { id: userId },
      data: { status: validatedStatus },
    });

    return {
      ok: true,
      message: "User status updated successfully",
      data: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        data: null,
        message: "Invalid status provided",
        error: {
          code: "VALIDATION_ERROR",
          details: error.errors,
        },
      };
    }

    return {
      ok: false,
      data: null,
      message: "Failed to update user status",
      error: {
        code: "DATABASE_ERROR",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
    };
  }
}

type UserQuery = IdQuery | EmailQuery;

interface IdQuery {
  id: string;
}
interface EmailQuery {
  email: string;
}

export async function getUser(
  query: UserQuery
): Promise<ActionResponse<UserWithRelations>> {
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

    // Get current user's role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // Fetch user with relations
    const user = await prisma.user.findUnique({
      where: query,
      include: {
        hostUsers: {
          include: {
            host: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return {
        ok: false,
        message: "User not found",
        data: null,
        error: {
          code: "NOT_FOUND",
        },
      };
    }

    return {
      ok: true,
      message: "User retrieved successfully",
      data: user,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      ok: false,
      message: "Failed to fetch user",
      data: null,
      error: {
        code: "DATABASE_ERROR",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
    };
  }
}

export async function updateUser(
  userId: string,
  data: {
    fname?: string;
    lname?: string;
    username?: string;
    email?: string;
    phone?: string;
    role?: string;
    image?: string;
  }
) {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data,
  });

  revalidatePath(`/admin/user/${userId}`);

  return user;
}

export async function deleteUser(userId: string) {
  const user = await prisma.user.delete({
    where: {
      id: userId,
    },
  });
  revalidatePath("/users");
  return user;
}

export async function uploadImage(formData: FormData) {
  const file = formData.get("image") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  try {
    const url = await uploadToS3(file, "users");

    // await saveImageUrlToDatabase(url);

    revalidatePath("/");

    return { success: true, url };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

// Server action to handle newsletter subscription
export async function subscribeToNewsletter(email: string) {
  try {
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address");
    }

    // Later we will:
    // 1. Validate the email isn't already subscribed
    // 2. Add the email to your newsletter service (e.g., Mailchimp)
    // 3. Store the subscription in your database
    // For now, we'll simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { success: true };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Subscription failed",
    };
  }
}

export async function getDashboardUser(): Promise<
  ActionResponse<User & { hostUsers: HostUser[] }>
> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return errorPayloads.notFound;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email,
      },
      include: {
        hostUsers: {
          include: {
            host: true,
          },
        },
      },
    });

    if (!user) {
      return errorPayloads.notFound;
    }

    if (!["admin", "host"].includes(user.role)) {
      return {
        ok: false,
        message: "Unauthorized access",
        data: null,
        error: {
          code: "UNAUTHORIZED_ROLE",
          details: { role: user.role },
        },
      };
    }

    return {
      ok: true,
      message: "User data retrieved successfully",
      data: user,
    };
  } catch (error) {
    console.error("Error fetching dashboard user:", error);
    return {
      ok: false,
      message: "Failed to fetch user data",
      data: null,
      error: {
        code: "FETCH_ERROR",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
    };
  }
}

type UserFormData = {
  role: "user" | "host" | "admin";
  name: string;
  status: "active" | "inactive" | "suspended" | "deleted" | "archived";
  image?: string;
  fname?: string;
  lname?: string;
  username?: string;
  email?: string;
  phone?: string;
  hostUsers?: {
    hostId: string;
    permissions: string;
    companyRole: string;
  }[];
};

export async function getUserWithRelations(
  query: UserQuery
): Promise<ActionResponse<UserFormData>> {
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

    // Get current user's role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || !canViewDashboard(currentUser.role)) {
      return {
        ok: false,
        message: "Not authorized",
        data: null,
        error: {
          code: "FORBIDDEN",
        },
      };
    }

    // Fetch user with relations
    const user = await prisma.user.findUnique({
      where: query,
      select: {
        id: true,
        role: true,
        name: true,
        status: true,
        image: true,
        fname: true,
        lname: true,
        username: true,
        email: true,
        phone: true,
        hostUsers: {
          select: {
            hostId: true,
            permissions: true,
            companyRole: true,
          },
        },
      },
    });

    if (!user) {
      return {
        ok: false,
        message: "User not found",
        data: null,
        error: {
          code: "NOT_FOUND",
        },
      };
    }

    // Validate and transform the data to match UserFormData type
    const formData: UserFormData = {
      role: user.role as "user" | "host" | "admin",
      name: user.name,
      status: user.status as
        | "active"
        | "inactive"
        | "suspended"
        | "deleted"
        | "archived",
      image: user.image ?? undefined,
      fname: user.fname ?? undefined,
      lname: user.lname ?? undefined,
      username: user.username ?? undefined,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      hostUsers: user.hostUsers,
    };

    return {
      ok: true,
      message: "User retrieved successfully",
      data: formData,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      ok: false,
      message: "Failed to fetch user",
      data: null,
      error: {
        code: "DATABASE_ERROR",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
    };
  }
}
