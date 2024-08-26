"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function createBooking(data: {
  propertyId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  totalPrice: string;
  status: string;
  userId: string;
}) {
  try {
    const booking = await prisma.booking.create({
      data: {
        propertyId: data.propertyId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        guestCount: data.guestCount,
        totalPrice: data.totalPrice,
        status: data.status,
        userId: data.userId,
      },
    });

    revalidatePath("/bookings");

    return booking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error("Failed to create booking");
  }
}

export async function getBookings() {
  try {
    const bookings = await prisma.booking.findMany();
    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Failed to fetch bookings");
  }
}

export async function getBookingById(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  } catch (error) {
    console.error(`Error fetching booking with id ${bookingId}:`, error);
    throw new Error(`Failed to fetch booking with id ${bookingId}`);
  }
}

export async function updateBooking(
  bookingId: string,
  data: {
    propertyId?: string;
    checkInDate?: Date;
    checkOutDate?: Date;
    guestCount?: number;
    totalPrice?: string;
    status?: string;
    userId?: string;
  }
) {
  try {
    const booking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data,
    });

    revalidatePath(`/bookings/${bookingId}`);

    return booking;
  } catch (error) {
    console.error(`Error updating booking with id ${bookingId}:`, error);
    throw new Error(`Failed to update booking with id ${bookingId}`);
  }
}

export async function deleteBooking(bookingId: string) {
  try {
    const booking = await prisma.booking.delete({
      where: {
        id: bookingId,
      },
    });

    revalidatePath("/bookings");

    return booking;
  } catch (error) {
    console.error(`Error deleting booking with id ${bookingId}:`, error);
    throw new Error(`Failed to delete booking with id ${bookingId}`);
  }
}
