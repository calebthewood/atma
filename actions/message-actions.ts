"use server";

import { revalidatePath } from "next/cache";
import { Message, Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  ActionResponse,
  getPaginationParams,
  PaginatedResponse,
} from "./shared";

/** ToC
 * Core CRUD Operations:
 *   - createMessage(data: MessageFormData): Promise<ActionResponse<Message>>
 *   - getMessage(id: string): Promise<ActionResponse<MessageWithRelations>>
 *   - updateMessage(id: string, data: Partial<MessageFormData>): Promise<ActionResponse<Message>>
 *   - deleteMessage(id: string): Promise<ActionResponse>
 *
 * List Operations:
 *   - getPaginatedMessages(page?: number, pageSize?: number): Promise<ActionResponse<PaginatedResponse<MessageWithRelations>>>
 *   - getMessagesByBooking(bookingId: string): Promise<ActionResponse<MessageWithRelations[]>>
 */

// ============================================================================
// Shared Query Configurations
// ============================================================================

const MESSAGE_INCLUDE_BASIC = {
  sender: {
    select: {
      id: true,
      name: true,
    },
  },
  receiver: {
    select: {
      id: true,
      name: true,
    },
  },
  booking: {
    select: {
      id: true,
      status: true,
    },
  },
} satisfies Prisma.MessageInclude;

// ============================================================================
// Types
// ============================================================================

export type MessageFormData = {
  timestamp: Date;
  bookingId: string;
  senderId: string;
  receiverId: string;
  content: string;
};

export type MessageWithRelations = Prisma.MessageGetPayload<{
  include: typeof MESSAGE_INCLUDE_BASIC;
}>;

// ============================================================================
// Core CRUD Operations
// ============================================================================

export async function createMessage(
  data: MessageFormData
): Promise<ActionResponse<Message>> {
  try {
    const message = await prisma.message.create({
      data: {
        timestamp: data.timestamp,
        content: data.content,
        booking: { connect: { id: data.bookingId } },
        sender: { connect: { id: data.senderId } },
        receiver: { connect: { id: data.receiverId } },
      },
    });

    revalidatePath("/messages");
    revalidatePath(`/bookings/${data.bookingId}`);

    return {
      ok: true,
      data: message,
      message: "Successfully created message",
    };
  } catch (error) {
    console.log("Failed to create message:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to create message",
    };
  }
}

export async function getMessage(
  id: string
): Promise<ActionResponse<MessageWithRelations>> {
  try {
    const message = await prisma.message.findUnique({
      where: { id },
      include: MESSAGE_INCLUDE_BASIC,
    });

    if (!message) {
      return {
        ok: false,
        data: null,
        message: "Message not found",
      };
    }

    return {
      ok: true,
      data: message,
      message: "Successfully fetched message",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error fetching message",
    };
  }
}

export async function updateMessage(
  id: string,
  data: Partial<MessageFormData>
): Promise<ActionResponse<Message>> {
  try {
    const updateData: Prisma.MessageUpdateInput = {
      ...(data.timestamp && { timestamp: data.timestamp }),
      ...(data.content && { content: data.content }),
      ...(data.bookingId && { booking: { connect: { id: data.bookingId } } }),
      ...(data.senderId && { sender: { connect: { id: data.senderId } } }),
      ...(data.receiverId && {
        receiver: { connect: { id: data.receiverId } },
      }),
    };

    const message = await prisma.message.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/messages");
    revalidatePath(`/messages/${id}`);
    if (data.bookingId) {
      revalidatePath(`/bookings/${data.bookingId}`);
    }

    return {
      ok: true,
      data: message,
      message: "Successfully updated message",
    };
  } catch (error) {
    console.log("Failed to update message:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to update message",
    };
  }
}

export async function deleteMessage(id: string): Promise<ActionResponse> {
  try {
    const message = await prisma.message.delete({ where: { id } });
    revalidatePath("/messages");
    revalidatePath(`/messages/${id}`);
    revalidatePath(`/bookings/${message.bookingId}`);

    return {
      ok: true,
      data: null,
      message: "Successfully deleted message",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error deleting message",
    };
  }
}

// ============================================================================
// List Operations
// ============================================================================

export async function getPaginatedMessages(
  page: number = 1,
  pageSize: number = 10
): Promise<ActionResponse<PaginatedResponse<MessageWithRelations>>> {
  try {
    const { skip, take } = getPaginationParams({ page, pageSize });

    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        skip,
        take,
        orderBy: { timestamp: "desc" },
        include: MESSAGE_INCLUDE_BASIC,
      }),
      prisma.message.count(),
    ]);

    return {
      ok: true,
      data: {
        items: messages,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
      message: "Successfully fetched paginated messages",
    };
  } catch (error) {
    console.log("Error in getPaginatedMessages:", error);
    return {
      ok: false,
      data: null,
      message: "Error fetching paginated messages",
    };
  }
}

export async function getMessagesByBooking(
  bookingId: string
): Promise<ActionResponse<MessageWithRelations[]>> {
  try {
    const messages = await prisma.message.findMany({
      where: { bookingId },
      orderBy: { timestamp: "asc" },
      include: MESSAGE_INCLUDE_BASIC,
    });

    return {
      ok: true,
      data: messages,
      message: "Successfully fetched booking messages",
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: "Error fetching booking messages",
    };
  }
}
