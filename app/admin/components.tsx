"use client";

import { usePathname } from "next/navigation";

const sidebarNavItems = [
  { title: "Users", href: "/admin/user" },
  { title: "Hosts", href: "/admin/host" },
  { title: "Properties", href: "/admin/properties" },
  { title: "Retreats", href: "/admin/retreats" },
  { title: "Programs", href: "/admin/programs" },
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
      <h2 className="text-2xl font-bold tracking-tight">
        Admin Dashboard <span>| {routeTitle}</span>
      </h2>
      <p className="text-muted-foreground">
        Create, Edit, or Delete database entries. More later...
      </p>
    </div>
  );
}
