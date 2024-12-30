"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  deleteHost,
  getAdminPaginatedHosts,
  type HostWithBasicRelations,
} from "@/actions/host-actions";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { BaseDataTable } from "@/components/admin/base-data-table";

import { AdminActionMenu } from "../components";

export function HostDataTable() {
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "WARNING! This will delete the host account and all associated properties, programs, and retreats"
    );

    if (confirmDelete) {
      try {
        const result = await deleteHost(id);
        if (!result.ok) {
          throw new Error(result.message);
        }

        toast({
          title: "Success",
          description: "Host deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete host:", error);
        toast({
          title: "Error",
          description: "Failed to delete host. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const columns = useMemo<ColumnDef<HostWithBasicRelations>[]>(
    () => [
      {
        accessorKey: "profilePic",
        header: "Profile",
        cell: ({ row }) => {
          const host = row.original;
          return (
            <Avatar>
              <AvatarImage src={host.profilePic || ""} />
              <AvatarFallback>{host.name?.[0]}</AvatarFallback>
            </Avatar>
          );
        },
      },
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
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          return <Badge variant="outline">{row.getValue("type")}</Badge>;
        },
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "phone",
        header: "Phone",
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const host = row.original;
          return (
            <AdminActionMenu
              editHref={`/admin/host/${host.id}/general`}
              publicHref={`/host/${host.id}`}
              handleDelete={() => handleDelete(host.id)}
            />
          );
        },
      },
    ],
    []
  );

  const router = useRouter();

  const handleRowClick = (row: HostWithBasicRelations) => {
    router.push(`/admin/host/${row.id}/general`);
  };

  return (
    <BaseDataTable<HostWithBasicRelations>
      columns={columns}
      fetchData={getAdminPaginatedHosts}
      onRowClick={handleRowClick}
      searchPlaceholder="Filter hosts..."
      type="host"
    />
  );
}
