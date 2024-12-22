"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { Booking, Prisma } from "@prisma/client";

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
          };
        };
      };
    };
    programInstance: {
      select: {
        program: {
          select: {
            name: true;
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

export async function getBooking(id: string): ActionResponse<Booking> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const whereClause: Prisma.BookingWhereInput = {
      id,
      ...(session.user.role !== "admin"
        ? {
            property: {
              hostId: session.user.hostId,
            },
          }
        : {}),
    };

    const booking = await prisma.booking.findFirst({
      where: whereClause,
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
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
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    return {
      success: true,
      data: booking,
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
