"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

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

export function AdminTitle() {
  const pathname = usePathname();

  const routeTitle =
    sidebarNavItems.find((item) => pathname.startsWith(item.href))?.title ||
    "Admin Dashboard";
  console.log(pathname);

  return (
    <div className="space-y-0.5">
      <h2 className="text-3xl tracking-tight">
        Admin Dashboard <span className="text-primary/70">| {routeTitle}</span>
      </h2>
      <p className="text-muted-foreground">
        Create, Edit, or Delete database entries. More later...
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
  publicHref: string;
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
        <DropdownMenuItem>
          <Link href={publicHref}>View Public Page</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
