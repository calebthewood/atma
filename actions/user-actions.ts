"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { HostUser, Prisma, User } from "@prisma/client";
import { z } from "zod";

import { errorPayloads } from "@/config/site";
import { canViewDashboard } from "@/lib/checks-and-balances";
import { prisma } from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";

import { getAuthenticatedUser } from "./auth-actions";
import {
  ActionResponse,
  getPaginationParams,
  PaginatedResponse,
} from "./shared";

// ============================================================================
// Shared Query Configurations
// ============================================================================

const USER_INCLUDE_FULL = {
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
} as const;

const USER_INCLUDE_ADMIN_LIST = {
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
} as const;

// ============================================================================
// Types
// ============================================================================

export type UserFormData = {
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

export type UserWithAllRelations = Prisma.UserGetPayload<{
  include: typeof USER_INCLUDE_FULL;
}>;

export type UserWithBasicRelations = Prisma.UserGetPayload<{
  include: typeof USER_INCLUDE_ADMIN_LIST;
}>;

type UserQuery = IdQuery | EmailQuery;

interface IdQuery {
  id: string;
}

interface EmailQuery {
  email: string;
}

// Input validation schemas
const updateRoleSchema = z.object({
  role: z.enum(["user", "host", "admin"]),
});

const updateStatusSchema = z.object({
  status: z.enum(["active", "inactive", "suspended", "deleted", "archived"]),
});

// Helper to build user search conditions
function buildUserSearchConditions(searchTerm: string): Prisma.UserWhereInput {
  if (!searchTerm) return {};

  return {
    OR: [
      { name: { contains: searchTerm } },
      { email: { contains: searchTerm } },
      { username: { contains: searchTerm } },
    ],
  };
}

// ============================================================================
// Core CRUD Operations
// ============================================================================

export async function createUser(
  data: UserFormData
): Promise<ActionResponse<UserFormData>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        ok: false,
        message: "Not authenticated",
        data: null,
      };
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || currentUser.role !== "admin") {
      return {
        ok: false,
        message: "Not authorized to create users",
        data: null,
      };
    }

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fname: data.fname,
          lname: data.lname,
          name: `${data.fname || ""} ${data.lname || ""}`.trim(),
          username: data.username,
          email: data.email,
          phone: data.phone,
          role: data.role,
          status: data.status,
          image: data.image,
        },
      });

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

      return tx.user.findUnique({
        where: { id: newUser.id },
        include: USER_INCLUDE_FULL,
      });
    });

    if (!user) {
      return {
        ok: false,
        message: "Failed to create user",
        data: null,
      };
    }

    revalidatePath("/admin/users");
    return {
      ok: true,
      message: "User created successfully",
      data: user as UserFormData,
    };
  } catch (error) {
    console.error("Error creating user:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target as string[];
        return {
          ok: false,
          message: `${target?.[0]} already exists`,
          data: null,
        };
      }
    }

    return {
      ok: false,
      message: "Failed to create user",
      data: null,
    };
  }
}

export async function getUser(
  query: UserQuery
): Promise<ActionResponse<UserWithAllRelations>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        ok: false,
        message: "Not authenticated",
        data: null,
      };
    }

    const user = await prisma.user.findUnique({
      where: query,
      include: USER_INCLUDE_FULL,
    });

    if (!user) {
      return {
        ok: false,
        message: "User not found",
        data: null,
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
    };
  }
}

export async function updateUser(
  userId: string,
  data: Partial<UserFormData>
): Promise<ActionResponse<User>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        ok: false,
        message: "Not authenticated",
        data: null,
      };
    }

    // Extract hostUsers from the data since we need to handle it separately
    const { hostUsers, ...userData } = data;

    // Prepare the update data according to Prisma's expected format
    const updateData: Prisma.UserUpdateInput = {
      ...userData,
      name:
        userData.fname || userData.lname
          ? `${userData.fname || ""} ${userData.lname || ""}`.trim()
          : undefined,
      // Handle hostUsers relationship if provided
      ...(hostUsers && {
        hostUsers: {
          deleteMany: {}, // First remove existing relationships
          create: hostUsers.map((hu) => ({
            hostId: hu.hostId,
            permissions: hu.permissions,
            companyRole: hu.companyRole,
            assignedBy: session.user.email!, // Use the current user's email as assignedBy
          })),
        },
      }),
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        hostUsers: true,
      },
    });

    revalidatePath(`/admin/user/${userId}`);
    revalidatePath("/admin/users");

    return {
      ok: true,
      message: "User updated successfully",
      data: user,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      ok: false,
      message: "Failed to update user",
      data: null,
    };
  }
}

export async function deleteUser(userId: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        ok: false,
        message: "Not authenticated",
        data: null,
      };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/users");

    return {
      ok: true,
      message: "User deleted successfully",
      data: null,
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      ok: false,
      message: "Failed to delete user",
      data: null,
    };
  }
}

// ============================================================================
// Admin List Operations
// ============================================================================

export async function getAdminPaginatedUsers(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
): Promise<ActionResponse<PaginatedResponse<UserWithBasicRelations>>> {
  try {
    const authResponse = await getAuthenticatedUser();
    if (!authResponse.ok || !authResponse.data) {
      return {
        ok: false,
        message: "Not authenticated",
        data: null,
      };
    }

    const authenticatedUser = authResponse.data;
    if (!canViewDashboard(authenticatedUser.role)) {
      return {
        ok: false,
        message: "Not authorized",
        data: null,
      };
    }

    const { skip, take } = getPaginationParams({ page, pageSize, searchTerm });
    const searchConditions = buildUserSearchConditions(searchTerm);

    const whereClause = {
      ...searchConditions,
      ...(authenticatedUser.role === "host"
        ? {
            hostUsers: {
              some: {
                hostId: {
                  in: (
                    await prisma.hostUser.findMany({
                      where: { userId: authenticatedUser.id },
                      select: { hostId: true },
                    })
                  ).map((hu) => hu.hostId),
                },
              },
            },
          }
        : {}),
    };

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        include: USER_INCLUDE_ADMIN_LIST,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return {
      ok: true,
      message: "Users retrieved successfully",
      data: {
        items: users,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      ok: false,
      message: "Failed to fetch users",
      data: null,
    };
  }
}
// ============================================================================
// Utility Operations
// ============================================================================

export async function uploadImage(
  formData: FormData
): Promise<ActionResponse<{ url: string }>> {
  try {
    const file = formData.get("image") as File;
    if (!file) {
      return {
        ok: false,
        message: "No file provided",
        data: null,
      };
    }

    const url = await uploadToS3(file, "user");
    revalidatePath("/");
    if (url.data) {
      return {
        ok: true,
        message: "Image uploaded successfully",
        data: { url: url.data },
      };
    } else {
      throw new Error("Failed to upload image");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      ok: false,
      message: "Failed to upload image",
      data: null,
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
      where: { email: session.user.email },
      include: { hostUsers: { include: { host: true } } },
    });

    if (!user) {
      return errorPayloads.notFound;
    }

    if (!["admin", "host"].includes(user.role)) {
      return {
        ok: false,
        message: "Unauthorized access",
        data: null,
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
    };
  }
}
