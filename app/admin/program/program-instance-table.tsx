"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  deleteInstance,
  getPaginatedInstances,
  type InstanceWithRelations,
  type PaginatedInstancesResponse,
} from "@/actions/program-instance-actions";
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

import { useUpdateSearchParam } from "@/hooks/use-search-params";
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

interface ProgramInstancesListProps {
  programId: string;
  initialInstances?: PaginatedInstancesResponse;
}

export function ProgramInstancesList({
  programId,
  initialInstances,
}: ProgramInstancesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParam();

  const [data, setData] = useState<InstanceWithRelations[]>(
    initialInstances?.instances || []
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [loading, setLoading] = useState(!initialInstances);
  const [totalPages, setTotalPages] = useState(
    initialInstances?.totalPages || 0
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleRowClick = (instanceId: string) => {
    updateSearchParams("edit", instanceId);
  };

  const columns: ColumnDef<InstanceWithRelations>[] = [
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Duration
            <CaretSortIcon className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const duration = row.getValue("duration") as number;
        return `${duration} nights`;
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
              const response = await deleteInstance(instance.id);

              if (response.success) {
                if (searchParams.get("edit") === instance.id) {
                  updateSearchParams("edit", null);
                }

                fetchInstances();
                toast({
                  title: "Success",
                  description: "Program instance deleted successfully",
                });
              } else {
                throw new Error(response.error || "Failed to delete");
              }
            } catch (error) {
              console.error("Failed to delete program instance:", error);
              toast({
                title: "Error",
                description: "Failed to delete program instance",
                variant: "destructive",
              });
            }
          }
        };

        return (
          <AdminActionMenu
            editHref={`/admin/program/${programId}/instance?edit=${instance.id}`}
            publicHref={`/program/${programId}/instance/${instance.id}`}
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
      const result = await getPaginatedInstances(
        pagination.pageIndex + 1,
        pagination.pageSize,
        programId
      );

      if (result.success && result.data) {
        setData(result.data.instances);
        setTotalPages(result.data.totalPages);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load program instances",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching program instances:", error);
      toast({
        title: "Error",
        description: "Failed to load program instances",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialInstances) {
      fetchInstances();
    }
  }, [pagination.pageIndex, pagination.pageSize, programId, initialInstances]);

  if (loading && !data.length) {
    return <div>Loading instances...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Program Instances</h3>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button
            variant="default"
            onClick={() => {
              updateSearchParams("edit", null);
            }}
          >
            Create Instance
          </Button>
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
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(row.original.id)}
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
