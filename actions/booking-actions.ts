"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { BookingFormData } from "@/schemas/booking-schema";
import { Booking, Prisma } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";

// ============================================================================
// Types
// ============================================================================
export type BookingWithDetails = Prisma.BookingGetPayload<{
  select: {
    id: true;
    checkInDate: true;
    checkOutDate: true;
    guestCount: true;
    totalPrice: true;
    status: true;
    createdAt: true;
    updatedAt: true;
    user: {
      select: {
        name: true;
        email: true;
      };
    };
    payments: {
      select: {
        status: true;
        amount: true;
        paymentDate: true;
      };
    };
    retreatInstance: {
      select: {
        retreat: {
          select: {
            name: true;
            property: true;
          };
        };
      };
    };
    programInstance: {
      select: {
        program: {
          select: {
            name: true;
            property: true;
          };
        };
      };
    };
  };
}>;

type PaginatedBookingsResponse = {
  bookings: BookingWithDetails[];
  totalPages: number;
  currentPage: number;
};

type ActionResponse<T> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
}>;

// ============================================================================
// Core Booking Operations
// ============================================================================

export async function createBookingOld(data: {
  propertyId: string;
  entity?: "retreat" | "program";
  entityId?: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  totalPrice: string;
  status: string;
  userId: string;
}) {
  try {
    const key = data.entity + "InstanceId";
    const booking = await prisma.booking.create({
      //@ts-ignore
      data: {
        propertyId: data.propertyId,
        [key]: data.entityId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        guestCount: data.guestCount,
        totalPrice: data.totalPrice,
        status: data.status,
        userId: data.userId,
      },
    });

    return booking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error("Failed to create booking");
  }
}

export async function createBooking(
  data: BookingFormData
): ActionResponse<Booking> {
  try {
    // Validate that at least one instance type is provided
    if (
      !data.propertyId &&
      !data.retreatInstanceId &&
      !data.programInstanceId
    ) {
      throw new Error(
        "Must provide either a property, retreat instance, or program instance"
      );
    }

    // Create the base booking data
    const createData: Prisma.BookingCreateInput = {
      checkInDate: new Date(data.checkInDate),
      checkOutDate: new Date(data.checkOutDate),
      guestCount: data.guestCount,
      totalPrice: data.totalPrice,
      status: data.status,
      // Connect required host
      host: {
        connect: { id: data.hostId },
      },
      // Connect to the user
      user: {
        connect: { id: data.userId },
      },
      // Connect to the property if provided
      ...(data.propertyId
        ? {
            property: {
              connect: { id: data.propertyId },
            },
          }
        : {}),
      // Connect to the retreat instance if provided
      ...(data.retreatInstanceId
        ? {
            retreatInstance: {
              connect: { id: data.retreatInstanceId },
            },
          }
        : {}),
      // Connect to the program instance if provided
      ...(data.programInstanceId
        ? {
            programInstance: {
              connect: { id: data.programInstanceId },
            },
          }
        : {}),
    };

    // Create the booking
    const booking = await prisma.booking.create({
      data: createData,
      include: {
        host: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        property: true,
        retreatInstance: {
          include: {
            retreat: {
              include: {
                property: true,
              },
            },
          },
        },
        programInstance: {
          include: {
            program: {
              include: {
                property: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Create a notification for the booking
    await prisma.notification.create({
      data: {
        timestamp: new Date(),
        status: "unread",
        user: {
          connect: { id: data.userId },
        },
        booking: {
          connect: { id: booking.id },
        },
      },
    });

    revalidatePath("/bookings");
    revalidatePath(`/booking/${booking.id}`);
    revalidatePath("/admin/bookings");

    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create booking",
    };
  }
}
export async function getAdminPaginatedBookings(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
): ActionResponse<PaginatedBookingsResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const skip = (page - 1) * pageSize;

    // Base search conditions
    const searchConditions: Prisma.BookingWhereInput = searchTerm
      ? {
          OR: [
            {
              retreatInstance: {
                retreat: {
                  name: { contains: searchTerm },
                },
              },
            },
            {
              programInstance: {
                program: {
                  name: { contains: searchTerm },
                },
              },
            },
            {
              user: {
                name: { contains: searchTerm },
              },
            },
            { status: { contains: searchTerm } },
          ],
        }
      : {};

    // Build where clause based on role
    const whereClause: Prisma.BookingWhereInput = {
      ...searchConditions,
      ...(session.user.role !== "admin"
        ? {
            hostId: session.user.hostId,
          }
        : {}),
    };

    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          checkInDate: true,
          checkOutDate: true,
          guestCount: true,
          totalPrice: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          payments: {
            select: {
              status: true,
              amount: true,
              paymentDate: true,
            },
            orderBy: {
              paymentDate: "desc",
            },
          },
          retreatInstance: {
            select: {
              retreat: {
                select: {
                  name: true,
                },
              },
            },
          },
          programInstance: {
            select: {
              program: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.booking.count({ where: whereClause }),
    ]);

    return {
      success: true,
      data: {
        bookings,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated bookings:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch bookings",
    };
  }
}

export async function getBooking(id: string): Promise<BookingWithDetails> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        // Include user data
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        // Include retreat instance and its related data
        retreatInstance: {
          include: {
            retreat: {
              include: {
                property: true,
              },
            },
          },
        },
        // Include program instance and its related data
        programInstance: {
          include: {
            program: {
              include: {
                property: true,
              },
            },
          },
        },
        // Include payments ordered by most recent first
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  } catch (error) {
    console.error("Failed to fetch booking:", error);
    throw error;
  }
}

export async function getAdminBooking(
  id: string
): ActionResponse<BookingWithDetails> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const whereClause: Prisma.BookingWhereInput = {
      id,
      ...(session.user.role !== "admin"
        ? {
            hostId: session.user.hostId,
          }
        : {}),
    };

    const booking = await prisma.booking.findFirst({
      where: whereClause,
      select: {
        id: true,
        checkInDate: true,
        checkOutDate: true,
        guestCount: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        payments: {
          select: {
            status: true,
            amount: true,
            paymentDate: true,
          },
          orderBy: {
            paymentDate: "desc",
          },
        },
        retreatInstance: {
          select: {
            retreat: {
              select: {
                name: true,
                property: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        programInstance: {
          select: {
            program: {
              select: {
                name: true,
                property: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    return { success: true, data: booking };
  } catch (error) {
    console.error("Error fetching booking:", error);
    return { success: false, error: "Failed to fetch booking" };
  }
}

export async function updateBookingStatus(
  id: string,
  status: string
): ActionResponse<BookingWithDetails> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        ...(session.user.role !== "admin"
          ? {
              property: {
                hostId: session.user.hostId,
              },
            }
          : {}),
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found or access denied" };
    }

    await prisma.booking.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: "Failed to update booking status" };
  }
}

export async function deleteBooking(
  id: string
): ActionResponse<BookingWithDetails> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        ...(session.user.role !== "admin"
          ? {
              property: {
                hostId: session.user.hostId,
              },
            }
          : {}),
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found or access denied" };
    }

    await prisma.booking.delete({
      where: { id },
    });

    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting booking:", error);
    return { success: false, error: "Failed to delete booking" };
  }
}
