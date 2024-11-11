"use client";

import { useEffect, useState } from "react";
import {
  deleteRetreatInstance,
  getPaginatedRetreatInstances,
} from "@/actions/retreat-instance";
import { RetreatInstance } from "@prisma/client";
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
import { differenceInDays } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface RetreatInstancesListProps {
  retreatId: string;
}

export function RetreatInstancesList({ retreatId }: RetreatInstancesListProps) {
  const [data, setData] = useState<RetreatInstance[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<RetreatInstance>[] = [
    {
      accessorKey: "startDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Start Date
            <CaretSortIcon className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("startDate"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            End Date
            <CaretSortIcon className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("endDate"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const startDate = new Date(row.getValue("startDate"));
        const endDate = new Date(row.getValue("endDate"));
        const days = differenceInDays(endDate, startDate);
        return `${days} days`;
      },
    },
    {
      accessorKey: "minNights",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Min Nights
            <CaretSortIcon className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const minNights = row.getValue("minNights") as number;
        return minNights === -1 ? "No minimum" : minNights;
      },
    },
    {
      accessorKey: "maxNights",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Max Nights
            <CaretSortIcon className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const maxNights = row.getValue("maxNights") as number;
        return maxNights === -1 ? "No maximum" : maxNights;
      },
    },
    {
      accessorKey: "availableSlots",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Available Slots
            <CaretSortIcon className="ml-2 size-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "isFull",
      header: "Status",
      cell: ({ row }) => {
        const isFull = row.getValue("isFull") as boolean;
        return (
          <span
            className={`rounded-full px-2 py-1 text-sm ${
              isFull
                ? "bg-red-100 text-red-800"
                : row.original.availableSlots < 5
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
            }`}
          >
            {isFull
              ? "Full"
              : row.original.availableSlots < 5
                ? "Limited"
                : "Available"}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const instance = row.original;

        const handleDelete = async () => {
          if (
            window.confirm("Are you sure you want to delete this instance?")
          ) {
            try {
              const result = await deleteRetreatInstance(instance.id);
              if (result.success) {
                fetchInstances();
                toast({
                  title: "Success",
                  description: "Retreat instance deleted successfully",
                });
              } else {
                throw new Error(result.error);
              }
            } catch (error) {
              console.error("Failed to delete retreat instance:", error);
              toast({
                title: "Error",
                description: "Failed to delete retreat instance",
                variant: "destructive",
              });
            }
          }
        };

        return (
          <AdminActionMenu
            editHref={`/admin/retreats/${retreatId}/instances/${instance.id}`}
            publicHref={`/retreats/${retreatId}/instances/${instance.id}`}
            handleDelete={handleDelete}
          />
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const result = await getPaginatedRetreatInstances(
        pagination.pageIndex + 1,
        pagination.pageSize,
        retreatId
      );

      if (result.success && result.data) {
        setData(result.data.instances);
        setTotalPages(result.data.totalPages);
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching retreat instances:", error);
      toast({
        title: "Error",
        description: "Failed to load retreat instances",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, [pagination.pageIndex, pagination.pageSize, retreatId]);

  if (loading && !data.length) {
    return <div>Loading instances...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Retreat Instances</h3>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
                <ChevronDownIcon className="ml-2 size-4" />
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  No instances found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <span className="text-sm text-muted-foreground">
          Page {pagination.pageIndex + 1} of {totalPages}
        </span>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
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
