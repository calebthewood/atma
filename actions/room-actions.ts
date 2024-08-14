"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRoom(data: {
  type: string;
  roomCount: string;
  amenities: string;
  bedType: string;
  minGuests: number;
  maxGuests: number;
  propertyId: string;
}) {
  try {
    const room = await prisma.room.create({
      data: {
        type: data.type,
        roomCount: data.roomCount,
        amenities: data.amenities,
        bedType: data.bedType,
        minGuests: data.minGuests,
        maxGuests: data.maxGuests,
        propertyId: data.propertyId,
      },
    });

    revalidatePath("/rooms");

    return room;
  } catch (error) {
    console.error("Error creating room:", error);
    throw new Error("Failed to create room");
  }
}

export async function getRooms() {
  try {
    const rooms = await prisma.room.findMany();
    return rooms;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw new Error("Failed to fetch rooms");
  }
}

export async function getRoomById(roomId: string) {
  try {
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    return room;
  } catch (error) {
    console.error(`Error fetching room with id ${roomId}:`, error);
    throw new Error(`Failed to fetch room with id ${roomId}`);
  }
}


export async function updateRoom(roomId: string, data: {
  type?: string;
  roomCount?: string;
  amenities?: string;
  bedType?: string;
  maxOccupancy?: string;
  hostId?: string;
  propertyId?: string;
}) {
  try {
    const room = await prisma.room.update({
      where: {
        id: roomId,
      },
      data,
    });

    revalidatePath(`/rooms/${roomId}`);

    return room;
  } catch (error) {
    console.error(`Error updating room with id ${roomId}:`, error);
    throw new Error(`Failed to update room with id ${roomId}`);
  }
}


export async function deleteRoom(roomId: string) {
  try {
    const room = await prisma.room.delete({
      where: {
        id: roomId,
      },
    });

    revalidatePath("/rooms");

    return room;
  } catch (error) {
    console.error(`Error deleting room with id ${roomId}:`, error);
    throw new Error(`Failed to delete room with id ${roomId}`);
  }
}