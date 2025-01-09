// components/admin/program-table.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteProgram,
  getAdminPaginatedPrograms,
  ProgramWithBasicRelations,
} from "@/actions/program-actions";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { BaseDataTable } from "@/components/admin/base-data-table";

import { AdminActionMenu } from "../components";

export function ProgramDataTable() {
  const router = useRouter();
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
        header: "Actions",
        cell: ({ row }) => {
          const program = row.original;
          return (
            <AdminActionMenu
              editHref={`/admin/program/${program?.id}/general`}
              publicHref={`/programs/${program?.id}`}
              handleDelete={() => handleDelete(program?.id)}
            />
          );
        },
      },
    ],
    []
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this program?")) {
      return;
    }

    const result = await deleteProgram(id);
    if (result.ok) {
      toast({
        title: "Success",
        description: "Program deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to delete program",
        variant: "destructive",
      });
    }
    return;
  };

  return (
    <BaseDataTable<ProgramWithBasicRelations>
      columns={columns}
      fetchData={getAdminPaginatedPrograms}
      deleteItem={handleDelete}
      searchPlaceholder="Filter programs..."
      type={"program"}
    />
  );
}
