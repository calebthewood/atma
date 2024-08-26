"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function createMessage(data: {
  timestamp: Date;
  bookingId: string;
  senderId: string;
  receiverId: string;
}) {
  try {
    const message = await prisma.message.create({
      data: {
        timestamp: data.timestamp,
        bookingId: data.bookingId,
        senderId: data.senderId,
        receiverId: data.receiverId,
      },
    });

    revalidatePath("/messages");

    return message;
  } catch (error) {
    console.error("Error creating message:", error);
    throw new Error("Failed to create message");
  }
}

export async function getMessages() {
  try {
    const messages = await prisma.message.findMany();
    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }
}

export async function getMessageById(messageId: string) {
  try {
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    return message;
  } catch (error) {
    console.error(`Error fetching message with id ${messageId}:`, error);
    throw new Error(`Failed to fetch message with id ${messageId}`);
  }
}

export async function updateMessage(
  messageId: string,
  data: {
    timestamp?: Date;
    bookingId?: string;
    senderId?: string;
    receiverId?: string;
  }
) {
  try {
    const message = await prisma.message.update({
      where: {
        id: messageId,
      },
      data,
    });

    revalidatePath(`/messages/${messageId}`);

    return message;
  } catch (error) {
    console.error(`Error updating message with id ${messageId}:`, error);
    throw new Error(`Failed to update message with id ${messageId}`);
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const message = await prisma.message.delete({
      where: {
        id: messageId,
      },
    });

    revalidatePath("/messages");

    return message;
  } catch (error) {
    console.error(`Error deleting message with id ${messageId}:`, error);
    throw new Error(`Failed to delete message with id ${messageId}`);
  }
}
