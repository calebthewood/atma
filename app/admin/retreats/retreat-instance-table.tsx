"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteRetreatInstance,
  getRetreatInstances,
} from "@/actions/retreat-instance";
import { RetreatInstance } from "@prisma/client";
import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
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
  const [instances, setInstances] = useState<RetreatInstance[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);

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
        const date = row.getValue("startDate") as Date;
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => {
        const date = row.getValue("endDate") as Date;
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "minNights",
      header: "Min Nights",
      cell: ({ row }) => {
        const minNights = row.getValue("minNights") as number;
        return minNights === -1 ? "No minimum" : minNights;
      },
    },
    {
      accessorKey: "maxNights",
      header: "Max Nights",
      cell: ({ row }) => {
        const maxNights = row.getValue("maxNights") as number;
        return maxNights === -1 ? "No maximum" : maxNights;
      },
    },
    {
      accessorKey: "availableSlots",
      header: "Available Slots",
    },
    {
      accessorKey: "isFull",
      header: "Status",
      cell: ({ row }) => {
        const isFull = row.getValue("isFull") as boolean;
        return (
          <span
            className={`rounded-full px-2 py-1 text-sm ${
              isFull ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {isFull ? "Full" : "Available"}
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
              await deleteRetreatInstance(instance.id);
              fetchInstances(); // Refresh the list
              toast({
                title: "Success",
                description: "Retreat instance deleted successfully",
              });
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
    data: instances,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const result = await getRetreatInstances(retreatId);
      if (result.success) {
        setInstances(result.instances);
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
  }, [retreatId]);

  if (loading) {
    return <div>Loading instances...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Retreat Instances</h3>
        <Button  asChild className="cursor-not-allowed">
          <Link href={`#`}>
            Add Instance
          </Link>
        </Button>
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
                  No instances found. Click "Add Instance" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
