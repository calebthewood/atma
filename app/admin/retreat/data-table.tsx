// components/admin/retreat-table.tsx
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  deleteRetreat,
  getAdminPaginatedRetreats,
  type RetreatWithBasicRelations,
} from "@/actions/retreat-actions";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { BaseDataTable } from "@/components/admin/base-data-table";

import { AdminActionMenu } from "../components";

export function RetreatDataTable() {
  const router = useRouter();

  const columns = useMemo<ColumnDef<RetreatWithBasicRelations>[]>(
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
          const retreat = row.original;
          return (
            <AdminActionMenu
              editHref={`/admin/retreat/${retreat?.id}/general`}
              publicHref={`/retreats/${retreat?.id}`}
              handleDelete={() => handleDelete(retreat.id)}
            />
          );
        },
      },
    ],
    [router]
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this retreat?")) {
      return;
    }

    const result = await deleteRetreat(id);
    if (result.ok) {
      toast({
        title: "Success",
        description: "Retreat deleted successfully",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: "Failed to delete retreat",
        variant: "destructive",
      });
    }
    return;
  };

  const handleRowClick = (retreat: RetreatWithBasicRelations) => {
    router.push(`/admin/retreat/${retreat.id}/general`);
  };

  return (
    <BaseDataTable
      columns={columns}
      fetchData={getAdminPaginatedRetreats}
      deleteItem={handleDelete}
      onRowClick={handleRowClick}
      searchPlaceholder="Filter retreats..."
    />
  );
}
