"use client";

import React, { useEffect, useState } from "react";
import { deleteRetreat, getPaginatedRetreats } from "@/actions/retreat-actions";
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

type Retreat = {
  id: string;
  name: string | null;
  bookingType: string | null;
  duration: string | null;
  date: Date | null;
  minGuests: number | null;
  maxGuests: number | null;
  propertyId: string;
  hostId: string | null;
  createdAt: Date;
  updatedAt: Date;
  propertyName: string;
  hostName: string | null;
};

const columns: ColumnDef<Retreat>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <CaretSortIcon className="ml-2 size-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "bookingType",
    header: "Booking Type",
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as Date | null;
      return date ? date.toLocaleDateString() : "Not set";
    },
  },
  {
    accessorKey: "guests",
    header: "Guests",
    cell: ({ row }) => {
      const min = row.original.minGuests;
      const max = row.original.maxGuests;
      return `${min || 0} - ${max || "unlimited"}`;
    },
  },
  {
    accessorKey: "propertyName",
    header: "Property",
  },
  {
    accessorKey: "hostName",
    header: "Host",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      return (row.getValue("updatedAt") as Date).toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const retreat = row.original;

      const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this retreat?")) {
          try {
            await deleteRetreat(retreat.id);
          } catch (error) {
            console.error("Failed to delete retreat:", error);
            alert("Failed to delete retreat. Please try again.");
          }
        }
      };

      return (
        <AdminActionMenu
          editHref={`/admin/retreats/${retreat.id}`}
          publicHref={`/retreats/${retreat.id}`}
          handleDelete={handleDelete}
        />
      );
    },
  },
];

export function RetreatDataTable() {
  const [data, setData] = useState<Retreat[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchRetreats();
  }, [pagination.pageIndex, pagination.pageSize, columnFilters]);

  const fetchRetreats = async () => {
    try {
      const searchTerm =
        (table.getColumn("name")?.getFilterValue() as string) ?? "";
      const result = await getPaginatedRetreats(
        pagination.pageIndex + 1,
        pagination.pageSize,
        searchTerm
      );
      setData(result.retreats);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to fetch retreats:", error);
    }
  };

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

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter retreats..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
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
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-24"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
