"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookingWithDetails,
  deleteBooking,
  getAdminPaginatedBookings,
} from "@/actions/booking-actions";
import { CaretSortIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AdminActionMenu } from "../components";

// Define the booking type with payment information

export function BookingsDataTable() {
  const router = useRouter();
  const [data, setData] = useState<BookingWithDetails[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const searchTerm =
        (columnFilters.find((f) => f.id === "property.name")
          ?.value as string) ?? "";

      const result = await getAdminPaginatedBookings(
        pagination.pageIndex + 1,
        pagination.pageSize,
        searchTerm
      );

      if (!result.success || !result.data) {
        throw new Error(result.error);
      }
      if (result.data) {
        setData(result.data.bookings);
        setTotalPages(result.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }, [pagination.pageIndex, pagination.pageSize, columnFilters]);

  const columns = useMemo<ColumnDef<BookingWithDetails>[]>(
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
        cell: ({ row }) => {
          const name = row.getValue("instanceName") as string;
          return <div>{name}</div>;
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
          const latestPayment = payments.length > 0 ? payments[0] : null;

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
          <>
            <Button asChild variant="ghost" size="sm">
              <Link
                href={`/admin/booking/${row.original.id}/details`}
                aria-label={`View details for booking ${row.original.id}`}
              >
                {" "}
                <Pencil className="size-4" />
                <span className="sr-only">View booking details</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this amenity?"
                  )
                ) {
                  handleDeleteBooking(row.original.id);
                }
              }}
              className="size-8 p-0"
            >
              <span className="sr-only">Delete</span>
              <Trash className="size-4" />
            </Button>
          </>
        ),
      },
    ],
    [fetchBookings]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    manualPagination: true,
    pageCount: totalPages,
  });

  // Memoize the filter handler
  const handleFilter = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      table.getColumn("instanceName")?.setFilterValue(event.target.value);
    },
    [table]
  );

  const handleDeleteBooking = async (id: string) => {
    await deleteBooking(id);
  };

  // Memoize pagination handlers
  const handlePreviousPage = useCallback(() => {
    table.previousPage();
  }, [table]);

  const handleNextPage = useCallback(() => {
    table.nextPage();
  }, [table]);

  const handleRowClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      // Check if the click was on the delete button or its children
      const target = e.target as HTMLElement;
      if (target.closest("button")) {
        return;
      }

      router.push(`/admin/booking/${id}/details`);
    },
    [router]
  );

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by event name..."
          value={
            (table.getColumn("instanceName")?.getFilterValue() as string) ?? ""
          }
          onChange={handleFilter}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column?.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column?.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup?.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header?.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row?.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell?.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <span>
          {pagination.pageIndex + 1}/{totalPages}
        </span>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="w-24"
            onClick={handlePreviousPage}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-24"
            onClick={handleNextPage}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
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

const getPropertyInfo = (booking: BookingWithDetails) => {
  if (booking.retreatInstance?.retreat.property) {
    return {
      id: booking.retreatInstance.retreat.property.id,
      name: booking.retreatInstance.retreat.property.name,
    };
  }
  if (booking.programInstance?.program.property) {
    return {
      id: booking.programInstance.program.property.id,
      name: booking.programInstance.program.property.name,
    };
  }
  return null;
};
