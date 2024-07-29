"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNotification(data: {
  timestamp: Date;
  status: string;
  userId: string;
  bookingId: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        timestamp: data.timestamp,
        status: data.status,
        userId: data.userId,
        bookingId: data.bookingId,
      },
    });

    revalidatePath("/notifications");

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
}

export async function getNotifications() {
  try {
    const notifications = await prisma.notification.findMany();
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}

export async function getNotificationById(notificationId: string) {
  try {
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    return notification;
  } catch (error) {
    console.error(`Error fetching notification with id ${notificationId}:`, error);
    throw new Error(`Failed to fetch notification with id ${notificationId}`);
  }
}


export async function updateNotification(notificationId: string, data: {
  timestamp?: Date;
  status?: string;
  userId?: string;
  bookingId?: string;
}) {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data,
    });

    revalidatePath(`/notifications/${notificationId}`);

    return notification;
  } catch (error) {
    console.error(`Error updating notification with id ${notificationId}:`, error);
    throw new Error(`Failed to update notification with id ${notificationId}`);
  }
}


export async function deleteNotification(notificationId: string) {
  try {
    const notification = await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    revalidatePath("/notifications");

    return notification;
  } catch (error) {
    console.error(`Error deleting notification with id ${notificationId}:`, error);
    throw new Error(`Failed to delete notification with id ${notificationId}`);
  }
}