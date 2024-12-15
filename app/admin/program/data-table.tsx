"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  deleteProgram,
  getPaginatedPrograms,
  type ProgramWithBasicRelations,
} from "@/actions/program-actions";
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
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

type Program = {
  id: string;
  name: string | null;
  duration: string | null;
  desc: string | null;
  priceList: string | null;
  sourceUrl: string | null;
  propertyId: string | null;
  hostId: string | null;
  createdAt: Date;
  updatedAt: Date;
  verified: Date | null;
};

export function ProgramDataTable() {
  const [data, setData] = useState<ProgramWithBasicRelations[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchTerm =
        (columnFilters.find((f) => f.id === "name")?.value as string) ?? "";
      const result = await getPaginatedPrograms(
        pagination.pageIndex + 1,
        pagination.pageSize,
        searchTerm
      );

      if (!result.success) {
        setError(result.error ?? "An unknown error occurred");
        return;
      }

      if (!result.data) {
        setError("No data received");
        return;
      }

      setData(result.data.programs);
      setTotalPages(result.data.totalPages);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      console.error("Failed to fetch programs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, columnFilters]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this program?")) {
      try {
        const result = await deleteProgram(id);

        if (!result.success) {
          throw new Error(result.error);
        }

        // Refresh the data
        fetchPrograms();

        toast({
          title: "Success",
          description: "Program deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete program:", error);
        toast({
          title: "Error",
          description: "Failed to delete program. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const columns = useMemo<ColumnDef<ProgramWithBasicRelations>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Name
              <CaretSortIcon className="ml-2 size-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "duration",
        header: "Duration",
      },
      {
        accessorKey: "priceList",
        header: "Price List",
        cell: ({ row }) => {
          const priceList = row.getValue("priceList") as string | null;
          return priceList ? priceList.split(",")[0] + "..." : "N/A";
        },
      },
      {
        accessorKey: "hostId",
        header: "Host",
        cell: ({ row }) => {
          const hostId = row.getValue("hostId") as string | null;
          return hostId ? (
            <Link
              href={`/admin/hosts/${hostId}`}
              className="text-blue-600 hover:underline"
            >
              View Host
            </Link>
          ) : (
            "N/A"
          );
        },
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
          const program = row.original;
          return (
            <AdminActionMenu
              editHref={`/admin/program/${program.id}/general`}
              publicHref={`/program/${program.id}`}
              handleDelete={() => handleDelete(program.id)}
            />
          );
        },
      },
    ],
    []
  );

  // Memoize table config
  const tableConfig = useMemo(
    () => ({
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
    }),
    [data, sorting, columnFilters, columnVisibility, pagination, totalPages]
  );

  const table = useReactTable(tableConfig);

  // Add cleanup and prevent state updates if unmounted
  useEffect(() => {
    let mounted = true;

    const doFetch = async () => {
      await fetchPrograms();
    };

    if (mounted) {
      doFetch();
    }

    return () => {
      mounted = false;
    };
  }, [fetchPrograms]);

  // Memoize the filter handler
  const handleFilter = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      table.getColumn("name")?.setFilterValue(event.target.value);
    },
    [table]
  );

  // Memoize pagination handlers
  const handlePreviousPage = useCallback(() => {
    table.previousPage();
  }, [table]);

  const handleNextPage = useCallback(() => {
    table.nextPage();
  }, [table]);

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter programs..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
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
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
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
