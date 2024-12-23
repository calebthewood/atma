"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookingWithBasicRelations,
  deleteBooking,
  getAdminPaginatedBookings,
} from "@/actions/booking-actions";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { BaseDataTable } from "@/components/admin/base-data-table";

export function BookingsDataTable() {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        const result = await deleteBooking(id);
        if (!result.ok) {
          throw new Error(result.message);
        }
        toast({
          title: "Success",
          description: "Booking deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete booking:", error);
        toast({
          title: "Error",
          description: "Failed to delete booking. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const columns = useMemo<ColumnDef<BookingWithBasicRelations>[]>(
    () => [
      {
        accessorKey: "instanceName",
        accessorFn: (row) => {
          return (
            row.retreatInstance?.retreat.name ||
            row.programInstance?.program.name ||
            "N/A"
          );
        },
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Event
              <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          return row.original.retreatInstance ? "Retreat" : "Program";
        },
      },
      {
        accessorKey: "checkInDate",
        header: "Check-In",
        cell: ({ row }) => {
          return new Date(row.getValue("checkInDate")).toLocaleDateString();
        },
      },
      {
        accessorKey: "checkOutDate",
        header: "Check-Out",
        cell: ({ row }) => {
          return new Date(row.getValue("checkOutDate")).toLocaleDateString();
        },
      },
      {
        accessorKey: "guestCount",
        header: "Guests",
      },
      {
        accessorKey: "totalPrice",
        header: "Total",
        cell: ({ row }) => {
          return `$${row.getValue("totalPrice")}`;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
        },
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment",
        cell: ({ row }) => {
          const payments = row.original.payments;
          const latestPayment = payments?.length > 0 ? payments[0] : null;

          return (
            <div>
              <Badge variant={getPaymentStatusVariant(latestPayment?.status)}>
                {latestPayment?.status || "No Payment"}
              </Badge>
              {latestPayment?.amount && (
                <div className="text-sm text-muted-foreground">
                  ${latestPayment.amount}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/booking/${row.original.id}/details`);
              }}
              className="size-8 p-0"
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit booking</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.original.id);
              }}
              className="size-8 p-0"
            >
              <Trash className="size-4" />
              <span className="sr-only">Delete booking</span>
            </Button>
          </div>
        ),
      },
    ],
    [router]
  );

  const handleRowClick = useCallback(
    (booking: BookingWithBasicRelations) => {
      router.push(`/admin/booking/${booking.id}/details`);
    },
    [router]
  );

  return (
    <BaseDataTable<BookingWithBasicRelations>
      columns={columns}
      fetchData={getAdminPaginatedBookings}
      searchPlaceholder="Filter by event name..."
      onRowClick={handleRowClick}
      searchField="instanceName"
    />
  );
}

// Helper functions for status badges
const getStatusVariant = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    upcoming: "default",
    completed: "secondary",
    cancelled: "destructive",
  };
  return variants[status] || "default";
};

const getPaymentStatusVariant = (status: string | undefined) => {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    paid: "secondary",
    pending: "default",
    failed: "destructive",
  };
  return variants[status || ""] || "default";
};
