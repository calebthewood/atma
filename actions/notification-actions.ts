"use server";

import { revalidatePath } from "next/cache";
import { Notification, Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  ActionResponse,
  getPaginationParams,
  PaginatedResponse,
} from "./shared";

/** ToC
 * Core CRUD Operations:
 *   - createNotification(data: NotificationFormData): Promise<ActionResponse<Notification>>
 *   - getNotification(id: string): Promise<ActionResponse<NotificationWithRelations>>
 *   - updateNotification(id: string, data: Partial<NotificationFormData>): Promise<ActionResponse<Notification>>
 *   - deleteNotification(id: string): Promise<ActionResponse>
 *
 * List Operations:
 *   - getPaginatedNotifications(page?: number, pageSize?: number): Promise<ActionResponse<PaginatedResponse<NotificationWithRelations>>>
 *   - getNotificationsByUser(userId: string): Promise<ActionResponse<NotificationWithRelations[]>>
 *   - getUnreadNotifications(userId: string): Promise<ActionResponse<NotificationWithRelations[]>>
 */

// ============================================================================
// Shared Query Configurations
// ============================================================================

const NOTIFICATION_INCLUDE_BASIC = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  booking: {
    select: {
      id: true,
      status: true,
    },
  },
} satisfies Prisma.NotificationInclude;

// ============================================================================
// Types
// ============================================================================

export type NotificationFormData = {
  timestamp: Date;
  status: string;
  userId: string;
  bookingId: string;
};

export type NotificationWithRelations = Prisma.NotificationGetPayload<{
  include: typeof NOTIFICATION_INCLUDE_BASIC;
}>;

// ============================================================================
// Core CRUD Operations
// ============================================================================

export async function createNotification(
  data: NotificationFormData
): Promise<ActionResponse<Notification>> {
  try {
    const notification = await prisma.notification.create({
      data: {
        timestamp: data.timestamp,
        status: data.status,
        user: { connect: { id: data.userId } },
        booking: { connect: { id: data.bookingId } },
      },
    });

    revalidatePath("/notifications");
    revalidatePath(`/users/${data.userId}/notifications`);

    return {
      ok: true,
      data: notification,
      message: "Successfully created notification",
    };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to create notification",
    };
  }
}

export async function getNotification(
  id: string
): Promise<ActionResponse<NotificationWithRelations>> {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: NOTIFICATION_INCLUDE_BASIC,
    });

    if (!notification) {
      return {
        ok: false,
        data: null,
        message: "Notification not found",
      };
    }

    return {
      ok: true,
      data: notification,
      message: "Successfully fetched notification",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error fetching notification",
    };
  }
}

export async function updateNotification(
  id: string,
  data: Partial<NotificationFormData>
): Promise<ActionResponse<Notification>> {
  try {
    const updateData: Prisma.NotificationUpdateInput = {
      ...(data.timestamp && { timestamp: data.timestamp }),
      ...(data.status && { status: data.status }),
      ...(data.userId && { user: { connect: { id: data.userId } } }),
      ...(data.bookingId && { booking: { connect: { id: data.bookingId } } }),
    };

    const notification = await prisma.notification.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/notifications");
    revalidatePath(`/notifications/${id}`);
    if (data.userId) {
      revalidatePath(`/users/${data.userId}/notifications`);
    }

    return {
      ok: true,
      data: notification,
      message: "Successfully updated notification",
    };
  } catch (error) {
    console.error("Failed to update notification:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to update notification",
    };
  }
}

export async function deleteNotification(id: string): Promise<ActionResponse> {
  try {
    const notification = await prisma.notification.delete({
      where: { id },
    });

    revalidatePath("/notifications");
    revalidatePath(`/users/${notification.userId}/notifications`);

    return {
      ok: true,
      data: null,
      message: "Successfully deleted notification",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error deleting notification",
    };
  }
}

// ============================================================================
// List Operations
// ============================================================================

export async function getPaginatedNotifications(
  page: number = 1,
  pageSize: number = 10
): Promise<ActionResponse<PaginatedResponse<NotificationWithRelations>>> {
  try {
    const { skip, take } = getPaginationParams({ page, pageSize });

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        skip,
        take,
        orderBy: { timestamp: "desc" },
        include: NOTIFICATION_INCLUDE_BASIC,
      }),
      prisma.notification.count(),
    ]);

    return {
      ok: true,
      data: {
        items: notifications,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
      message: "Successfully fetched paginated notifications",
    };
  } catch (error) {
    console.error("Error in getPaginatedNotifications:", error);
    return {
      ok: false,
      data: null,
      message: "Error fetching paginated notifications",
    };
  }
}

export async function getNotificationsByUser(
  userId: string
): Promise<ActionResponse<NotificationWithRelations[]>> {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      include: NOTIFICATION_INCLUDE_BASIC,
    });

    return {
      ok: true,
      data: notifications,
      message: "Successfully fetched user notifications",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error fetching user notifications",
    };
  }
}

export async function getUnreadNotifications(
  userId: string
): Promise<ActionResponse<NotificationWithRelations[]>> {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        status: "unread",
      },
      orderBy: { timestamp: "desc" },
      include: NOTIFICATION_INCLUDE_BASIC,
    });

    return {
      ok: true,
      data: notifications,
      message: "Successfully fetched unread notifications",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error fetching unread notifications",
    };
  }
}
