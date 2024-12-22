"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sidebarNavItems = [
  { title: "Users", href: "/admin/users" },
  { title: "Hosts", href: "/admin/hosts" },
  { title: "Properties", href: "/admin/property" },
  { title: "Retreats", href: "/admin/retreat" },
  { title: "Programs", href: "/admin/program" },
  { title: "Payments", href: "/admin/payment" },
  { title: "Bookings", href: "/admin/booking" },
  { title: "Admin", href: "/admin" },
];

export function AdminTitle({ isHost }: { isHost: boolean }) {
  const pathname = usePathname();

  const routeTitle =
    sidebarNavItems.find((item) => pathname.startsWith(item.href))?.title ||
    "Admin Dashboard";

  return (
    <div
      className={cn("space-y-0.5 p-3 rounded text-white", isHost ? "bg-[#29361a]" : "bg-[#9b1025]")}
    >
      <h2 className="text-3xl tracking-tight">
        {isHost ? "Host Dashboard " : "Admin Dashboard "}
        <span className="text-white/80">| {routeTitle}</span>
      </h2>
      <p className="text-white/80">
        {isHost
          ? "Manage your retreats, programs, and properties all from one place"
          : "Create, edit, and manage ATMA Reserve from one place"}
      </p>
    </div>
  );
}

export function AdminActionMenu({
  editHref,
  handleDelete,
  publicHref,
}: {
  editHref: string;
  handleDelete: () => void;
  publicHref?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <DotsHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={editHref}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
        <DropdownMenuSeparator />
        {publicHref && (
          <DropdownMenuItem>
            <Link href={publicHref}>View Public Page</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
