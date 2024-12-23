// components/admin/property-table.tsx
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  deleteProperty,
  getAdminPaginatedProperties,
  PropertyWithBasicRelations,
} from "@/actions/property-actions";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { BaseDataTable } from "@/components/admin/base-data-table";

import { AdminActionMenu } from "../components";

export function PropertyDataTable() {
  const router = useRouter();
  const columns = useMemo<ColumnDef<PropertyWithBasicRelations>[]>(
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
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "address",
        header: "Address",
      },
      {
        accessorKey: "city",
        header: "City",
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
          const property = row.original;

          const handleDelete = async () => {
            if (
              window.confirm("Are you sure you want to delete this property?")
            ) {
              try {
                await deleteProperty(property?.id);
              } catch (error) {
                console.error("Failed to delete property:", error);
                alert("Failed to delete property. Please try again.");
              }
            }
          };

          return (
            <AdminActionMenu
              editHref={`/admin/property/${property?.id}/general`}
              publicHref={`/destinations/${property?.id}`}
              handleDelete={handleDelete}
            />
          );
        },
      },
    ],
    []
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    const result = await deleteProperty(id);
    if (result.ok) {
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
      return;
    }

    toast({
      title: "Error",
      description: "Failed to delete property",
      variant: "destructive",
    });
    return;
  };

  const handleRowClick = (property: PropertyWithBasicRelations) => {
    router.push(`/admin/property/${property.id}/general`);
  };

  return (
    <BaseDataTable
      columns={columns}
      fetchData={getAdminPaginatedProperties}
      deleteItem={handleDelete}
      onRowClick={handleRowClick}
      searchPlaceholder="Filter properties..."
    />
  );
}
