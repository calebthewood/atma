"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminPaginatedUsers,
  updateUser,
  UserWithBasicRelations,
} from "@/actions/user-actions";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { BaseDataTable } from "@/components/admin/base-data-table";

const roles = ["user", "host", "admin"] as const;
const statuses = [
  "active",
  "inactive",
  "suspended",
  "deleted",
  "archived",
] as const;

type Role = (typeof roles)[number];
type Status = (typeof statuses)[number];

export function UserDataTable() {
  const router = useRouter();

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      const result = await updateUser(userId, { role: newRole });
      if (!result.ok) {
        throw new Error(result.message);
      }

      toast({
        title: "Success",
        description: result.message || "User role updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (userId: string, newStatus: Status) => {
    try {
      const result = await updateUser(userId, { status: newStatus });
      if (!result.ok) {
        throw new Error(result.message);
      }

      toast({
        title: "Success",
        description: result.message || "User status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const columns = useMemo<ColumnDef<UserWithBasicRelations>[]>(
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
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              {user.hostUsers && user.hostUsers.length > 0 && (
                <div className="mt-1 flex gap-1">
                  {user.hostUsers.map((hu) => (
                    <Badge
                      key={hu.hostId}
                      variant="secondary"
                      className="text-xs"
                    >
                      {hu.host.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Email
              <CaretSortIcon className="ml-2 size-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <Select
              value={user.role}
              onValueChange={(value: Role) => handleRoleChange(user.id, value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <Select
              value={user.status}
              onValueChange={(value: Status) =>
                handleStatusChange(user.id, value)
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Updated
              <CaretSortIcon className="ml-2 size-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return format(new Date(row.getValue("updatedAt")), "MMM d, yyyy");
        },
      },
    ],
    []
  );

  const handleRowClick = (user: UserWithBasicRelations) => {
    router.push(`/admin/user/${user.id}/general`);
  };

  return (
    <BaseDataTable
      columns={columns}
      fetchData={getAdminPaginatedUsers}
      searchPlaceholder="Search users..."
      onRowClick={handleRowClick}
      type="none"
    />
  );
}
