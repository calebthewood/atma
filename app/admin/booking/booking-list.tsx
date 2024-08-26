"use client";

import { useEffect, useState } from "react";
import { getBookings } from "@/actions/booking-actions";
import { Booking } from "@prisma/client";
import { format } from "date-fns";

import { toUSD } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        setIsLoading(true);
        const fetchedBookings = await getBookings();
        setBookings(fetchedBookings);
        setError(null);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Failed to fetch bookings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookings();
  }, []);

  if (isLoading) {
    return <div>Loading bookings...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property ID</TableHead>
          <TableHead>Check-In</TableHead>
          <TableHead>Check-Out</TableHead>
          <TableHead>Guests</TableHead>
          <TableHead>Total Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <BookingListItem key={booking.id} booking={booking} />
        ))}
      </TableBody>
    </Table>
  );
}

interface BookingListItemProps {
  booking: Booking;
}

export function BookingListItem({ booking }: BookingListItemProps) {
  return (
    <TableRow>
      <TableCell>{booking.propertyId}</TableCell>
      <TableCell>{format(booking.checkInDate, "MMM d, yyyy")}</TableCell>
      <TableCell>{format(booking.checkOutDate, "MMM d, yyyy")}</TableCell>
      <TableCell>{booking.guestCount}</TableCell>
      <TableCell>{toUSD(booking.totalPrice)}</TableCell>
      <TableCell>{booking.status}</TableCell>
      <TableCell>
        {/* Add action buttons here, e.g., View Details, Edit, Cancel */}
        <button>actions</button>
      </TableCell>
    </TableRow>
  );
}
