"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { deletePriceMod, getPriceModsByProgramInstance, getPriceModsByRetreatInstance, PriceModWithRelations } from "@/actions/price-mod-actions";
import type { PriceMod } from "@prisma/client";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, PlusCircle } from "lucide-react";



import { toUSD } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";



import { AdminActionMenu } from "../components";


const useUpdateSearchParam = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return updateSearchParams;
};

export function PriceModsTable() {
  const [data, setData] = useState<PriceModWithRelations[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState({});

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const updateSearchParams = useUpdateSearchParam();
  const instanceId = searchParams.get("edit");

  const columns: ColumnDef<PriceMod>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ChevronsUpDown className="ml-2 size-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type
            <ChevronsUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return type.replace("_", " ").toLowerCase();
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Value
            <ChevronsUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("value") as number;
        const unit = row.original.unit;
        const currency = row.original.currency;

        return unit === "PERCENT" ? `${value}%` : toUSD(value);
      },
    },
    {
      accessorKey: "dateRange",
      header: "Date Range",
      cell: ({ row }) => {
        const dateRange = row.getValue("dateRange") as string;
        if (!dateRange || dateRange === "all") return "All dates";

        const [start, end] = dateRange.split(",");
        return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
      },
    },
    {
      accessorKey: "roomType",
      header: "Room Type",
      cell: ({ row }) => {
        const roomType = row.getValue("roomType") as string;
        return roomType === "all" ? "All rooms" : roomType;
      },
    },
    {
      accessorKey: "desc",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.getValue("desc") as string;
        return (
          <div className="max-w-[500px] truncate" title={desc}>
            {desc}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const priceMod = row.original;

        const handleDelete = async () => {
          if (
            window.confirm(
              "Are you sure you want to delete this price modification?"
            )
          ) {
            try {
              const response = await deletePriceMod(priceMod.id);

              if (response.success) {
                // Clear price param if deleting the currently edited price mod
                if (searchParams.get("price") === priceMod.id) {
                  updateSearchParams({ price: null });
                }

                fetchPriceMods();
                toast({
                  title: "Success",
                  description: "Price modification deleted successfully",
                });
              } else {
                throw new Error(response.error || "Failed to delete");
              }
            } catch (error) {
              console.error("Failed to delete price modification:", error);
              toast({
                title: "Error",
                description: "Failed to delete price modification",
                variant: "destructive",
              });
            }
          }
        };

        return (
          <AdminActionMenu
            editHref=""
            publicHref=""
            handleDelete={handleDelete}
          />
        );
      },
    },
  ];

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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const fetchPriceMods = async () => {
    if (!instanceId) return;

    try {
      setLoading(true);

      const response = pathname.includes("retreat")
        ? await getPriceModsByRetreatInstance(instanceId)
        : await getPriceModsByProgramInstance(instanceId);

      if (response.success && response.data) {
        setData(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load price modifications",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching price modifications:", error);
      toast({
        title: "Error",
        description: "Failed to load price modifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceMods();
  }, [instanceId]);

  const handleRowClick = (priceModId: string) => {
    updateSearchParams({ price: priceModId });
  };

  if (!instanceId) {
    return (
      <div className="text-center text-muted-foreground">
        Select a retreat instance to view price modifications
      </div>
    );
  }

  if (loading && !data.length) {
    return <div>Loading price modifications...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Price Modifications</h3>
      </div>

      <div className="flex items-center justify-between space-x-2">
        <Input
          icon="search"
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="grow"
        />
        <Button
          variant="default"
          onClick={() => updateSearchParams({ price: null })}
        >
          <PlusCircle className="mr-2 size-4" />
          New Price Modification
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns
              <ChevronDown className="ml-2 size-4" />
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
                  No price modifications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}