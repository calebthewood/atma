// actions/booking-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { BookingFormData } from "@/schemas/booking-schema";
import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  ActionResponse,
  getPaginationParams,
  PaginatedResponse,
} from "./shared";

/** Table of Contents
 * Query Configurations:
 *   - BOOKING_INCLUDE_FULL
 *   - BOOKING_INCLUDE_ADMIN_LIST
 *
 * Core CRUD Operations:
 *   - createBooking(data: BookingFormData): Promise<ActionResponse<BookingWithAllRelations>>
 *   - getBooking(id: string): Promise<ActionResponse<BookingWithAllRelations>>
 *   - updateBookingStatus(id: string, status: string): Promise<ActionResponse>
 *   - deleteBooking(id: string): Promise<ActionResponse>
 *
 * Admin Operations:
 *   - getAdminBooking(id: string): Promise<ActionResponse<BookingWithAllRelations>>
 *   - getAdminPaginatedBookings(page?: number, pageSize?: number, searchTerm?: string): Promise<ActionResponse<PaginatedResponse<BookingWithBasicRelations>>>
 */

// ============================================================================
// Query Configurations
// ============================================================================

const BOOKING_INCLUDE_FULL = {
  user: {
    select: {
      name: true,
      email: true,
    },
  },
  retreatInstance: {
    select: {
      retreat: {
        select: { name: true },
      },
    },
  },
  programInstance: {
    select: {
      program: {
        select: { name: true },
      },
    },
  },
  property: { select: { name: true, address: true } },
  payments: {
    orderBy: {
      createdAt: "desc",
    },
  },
} satisfies Prisma.BookingSelect;

const BOOKING_ADMIN_SELECT = {
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
} satisfies Prisma.BookingSelect;

// ============================================================================
// Types
// ============================================================================

export type BookingWithAllRelations = Prisma.BookingGetPayload<{
  include: typeof BOOKING_INCLUDE_FULL;
}>;

export type BookingWithBasicRelations = Prisma.BookingGetPayload<{
  select: typeof BOOKING_ADMIN_SELECT;
}>;

function buildBookingSearchConditions(
  searchTerm: string
): Prisma.BookingWhereInput {
  if (!searchTerm) return {};

  return {
    OR: [
      { retreatInstance: { retreat: { name: { contains: searchTerm } } } },
      { programInstance: { program: { name: { contains: searchTerm } } } },
      { user: { name: { contains: searchTerm } } },
      { status: { contains: searchTerm } },
    ],
  };
}

// ============================================================================
// Core CRUD Operations
// ============================================================================

type BaseBookingData = {
  userId: string;
  hostId: string;
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: string;
  status: string;
};

type RetreatBookingData = BaseBookingData & {
  retreatInstanceId: string;
};

type ProgramBookingData = BaseBookingData & {
  programInstanceId: string;
};

async function createBookingWithNotification(
  createData: Prisma.BookingCreateInput
): Promise<ActionResponse<BookingWithAllRelations>> {

  const booking = await prisma.booking.create({
    data: createData,
    include: BOOKING_INCLUDE_FULL,
  });

  await prisma.notification.create({
    data: {
      timestamp: new Date(),
      status: "pending",
      user: { connect: { id: createData.user.connect!.id } },
      booking: { connect: { id: booking.id } },
    },
  });

  revalidatePath("/admin/bookings");
  return {
    ok: true,
    data: booking,
    message: "Successfully created booking",
  };

  // console.log("Failed to create booking:", error);
  // return {
  //   ok: false,
  //   data: null,
  //   message: error instanceof Error ? error.message : "Failed to create booking",
  // };
}

export async function createRetreatBooking(
  data: RetreatBookingData
): Promise<ActionResponse<BookingWithAllRelations>> {
  const createData: Prisma.BookingCreateInput = {
    checkInDate: new Date(data.checkInDate),
    checkOutDate: new Date(data.checkOutDate),
    guestCount: data.guestCount,
    totalPrice: data.totalPrice,
    status: data.status,
    property: { connect: { id: data.propertyId } },
    host: { connect: { id: data.hostId } },
    user: { connect: { id: data.userId } },
    retreatInstance: { connect: { id: data.retreatInstanceId } },
  };
  // console.log("data.retreatInstanceId", data.retreatInstanceId);
  return await createBookingWithNotification(createData);
}

export async function createProgramBooking(
  data: ProgramBookingData
): Promise<ActionResponse<BookingWithAllRelations>> {
  const createData: Prisma.BookingCreateInput = {
    checkInDate: new Date(data.checkInDate),
    checkOutDate: new Date(data.checkOutDate),
    guestCount: data.guestCount,
    totalPrice: data.totalPrice,
    status: data.status,
    property: { connect: { id: data.propertyId } },
    host: { connect: { id: data.hostId } },
    user: { connect: { id: data.userId } },
    programInstance: { connect: { id: data.programInstanceId } },
  };

  return await createBookingWithNotification(createData);
}

export async function getBooking(
  id?: string // Make id optional to handle undefined case
): Promise<ActionResponse<BookingWithAllRelations>> {
  try {
    // Early return if no id provided
    if (!id) {
      return {
        ok: false,
        data: null,
        message: "Booking ID is required",
      };
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDE_FULL,
    });

    if (!booking) {
      return {
        ok: false,
        data: null,
        message: "Booking not found",
      };
    }

    return {
      ok: true,
      data: booking,
      message: "Successfully fetched booking",
    };
  } catch (error) {
    console.log("Failed to fetch booking:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to fetch booking",
    };
  }
}

export async function updateBookingStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled"
): Promise<ActionResponse<BookingWithAllRelations>> {
  try {
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return { ok: false, data: null, message: "Unauthorized" };
    // }
    const bookingExists = await prisma.booking.findFirst({
      where: { id },
    });

    if (!bookingExists) {
      return {
        ok: false,
        data: null,
        message: "Booking not found",
      };
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: BOOKING_INCLUDE_FULL,
    });

    revalidatePath("/admin/bookings");
    revalidatePath(`/booking/${id}`);

    return {
      ok: true,
      data: booking,
      message: "Successfully updated booking status",
    };
  } catch (error) {
    console.log("Error updating booking status:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to update booking status",
    };
  }
}

export async function updateBooking(
  id: string,
  data: Partial<BookingFormData>
): Promise<ActionResponse<BookingWithAllRelations>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    const whereClause = {
      id,
      ...(session.user.role !== "admin"
        ? {
            property: { hostId: session.user.hostId },
          }
        : {}),
    };

    // Check if booking exists and user has access
    const existingBooking = await prisma.booking.findFirst({
      where: whereClause,
    });

    if (!existingBooking) {
      return {
        ok: false,
        data: null,
        message: "Booking not found or access denied",
      };
    }

    // Prepare update data
    const updateData: Prisma.BookingUpdateInput = {
      ...(data.checkInDate ? { checkInDate: new Date(data.checkInDate) } : {}),
      ...(data.checkOutDate
        ? { checkOutDate: new Date(data.checkOutDate) }
        : {}),
      ...(data.guestCount ? { guestCount: data.guestCount } : {}),
      ...(data.totalPrice ? { totalPrice: data.totalPrice } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.hostId ? { host: { connect: { id: data.hostId } } } : {}),
      ...(data.userId ? { user: { connect: { id: data.userId } } } : {}),
      ...(data.propertyId
        ? { property: { connect: { id: data.propertyId } } }
        : {}),
      ...(data.retreatInstanceId
        ? { retreatInstance: { connect: { id: data.retreatInstanceId } } }
        : {}),
      ...(data.programInstanceId
        ? { programInstance: { connect: { id: data.programInstanceId } } }
        : {}),
    };

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: BOOKING_INCLUDE_FULL,
    });

    revalidatePath("/admin/booking");
    revalidatePath(`/admin/booking/${id}`);

    return {
      ok: true,
      data: booking,
      message: "Successfully updated booking",
    };
  } catch (error) {
    console.log("Failed to update booking:", error);
    return {
      ok: false,
      data: null,
      message:
        error instanceof Error ? error.message : "Failed to update booking",
    };
  }
}

export async function deleteBooking(id: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    const whereClause = {
      id,
      ...(session.user.role !== "admin"
        ? {
            property: { hostId: session.user.hostId },
          }
        : {}),
    };

    const booking = await prisma.booking.findFirst({ where: whereClause });

    if (!booking) {
      return {
        ok: false,
        data: null,
        message: "Booking not found or access denied",
      };
    }

    await prisma.booking.delete({ where: { id } });

    revalidatePath("/admin/bookings");
    return { ok: true, data: null, message: "Successfully deleted booking" };
  } catch (error) {
    console.log("Error deleting booking:", error);
    return { ok: false, data: null, message: "Failed to delete booking" };
  }
}

// ============================================================================
// Admin Operations
// ============================================================================

export async function getAdminPaginatedBookings(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = "",
  userId?: string
): Promise<ActionResponse<PaginatedResponse<BookingWithBasicRelations>>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    const { skip, take } = getPaginationParams({ page, pageSize });
    const searchConditions = buildBookingSearchConditions(searchTerm);

    const whereClause = {
      ...searchConditions,
      // Include userId filter if provided
      ...(userId ? { userId } : {}),
      // Apply host filtering for non-admin users
      ...(session.user.role !== "admin" ? { hostId: session.user.hostId } : {}),
    };

    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        select: BOOKING_ADMIN_SELECT,
      }),
      prisma.booking.count({ where: whereClause }),
    ]);

    return {
      ok: true,
      data: {
        items: bookings,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
      message: "Successfully fetched bookings",
    };
  } catch (error) {
    console.log("Error fetching paginated bookings:", error);
    return {
      ok: false,
      data: null,
      message: "Failed to fetch bookings",
    };
  }
}

export async function getAdminBooking(
  id: string
): Promise<ActionResponse<BookingWithBasicRelations>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, data: null, message: "Unauthorized" };
    }

    const whereClause = {
      id,
      ...(session.user.role !== "admin" ? { hostId: session.user.hostId } : {}),
    };

    const booking = await prisma.booking.findFirst({
      where: whereClause,
      select: BOOKING_ADMIN_SELECT,
    });

    if (!booking) {
      return { ok: false, data: null, message: "Booking not found" };
    }

    return { ok: true, data: booking, message: "Successfully fetched booking" };
  } catch (error) {
    console.log("Error fetching booking:", error);
    return { ok: false, data: null, message: "Failed to fetch booking" };
  }
}
