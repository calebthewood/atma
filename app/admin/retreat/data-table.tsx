"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteRetreat,
  getPaginatedRetreats,
  type RetreatWithBasicRelations,
} from "@/actions/retreat-actions";
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
import { toast } from "@/components/ui/use-toast";

import { AdminActionMenu } from "../components";

const columns: ColumnDef<RetreatWithBasicRelations>[] = [
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
      return `${min ?? 0} - ${max ?? "unlimited"}`;
    },
  },
  {
    accessorKey: "property",
    header: "Property",
    cell: ({ row }) => row.original.property?.name ?? "N/A",
  },
  {
    accessorKey: "host",
    header: "Host",
    cell: ({ row }) => row.original.host?.name ?? "N/A",
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
      const router = useRouter();
      const retreat = row.original;

      const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this retreat?")) {
          try {
            const response = await deleteRetreat(retreat.id);
            if (!response.success) {
              throw new Error(response.error);
            }
            toast({
              title: "Success",
              description: "Retreat deleted successfully",
            });
            router.refresh();
          } catch (error) {
            console.error("Failed to delete retreat:", error);
            toast({
              title: "Error",
              description:
                error instanceof Error
                  ? error.message
                  : "Failed to delete retreat. Please try again.",
              variant: "destructive",
            });
          }
        }
      };

      return (
        <AdminActionMenu
          editHref={`/admin/retreat/${retreat.id}/general`}
          publicHref={`/retreats/${retreat.id}`}
          handleDelete={handleDelete}
        />
      );
    },
  },
];

export function RetreatDataTable() {
  const [data, setData] = useState<RetreatWithBasicRelations[]>([]);
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

      if (!result.success || !result.data) {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch retreats",
          variant: "destructive",
        });
        setData([]); // Set empty data when there's an error
        setTotalPages(0);
        return;
      }
      setData(result.data.retreats ?? []); // Ensure we have retreats before setting the data
      setTotalPages(result.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch retreats:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching retreats",
        variant: "destructive",
      });

      setData([]); // Set empty data on error
      setTotalPages(0);
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
