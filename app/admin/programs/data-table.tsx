"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProgram, getPaginatedPrograms } from "@/actions/program-actions";
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
const columns: ColumnDef<Program>[] = [
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

      const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this program?")) {
          try {
            await deleteProgram(program.id);
          } catch (error) {
            console.error("Failed to delete program:", error);
            alert("Failed to delete program. Please try again.");
          }
        }
      };

      return (
        <AdminActionMenu
          editHref={`/admin/programs/${program.id}/general`}
          publicHref={`/programs/${program.id}`}
          handleDelete={handleDelete}
        />
      );
    },
  },
];

export function ProgramDataTable() {
  const [data, setData] = useState<Program[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);

  // Memoize fetchPrograms to prevent recreation on every render
  const fetchPrograms = useCallback(async () => {
    try {
      const searchTerm =
        (columnFilters.find((f) => f.id === "name")?.value as string) ?? "";
      const result = await getPaginatedPrograms(
        pagination.pageIndex + 1,
        pagination.pageSize,
        searchTerm
      );
      setData(result.programs);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  }, [pagination.pageIndex, pagination.pageSize, columnFilters]);

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
