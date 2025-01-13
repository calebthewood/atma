import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { canViewDashboard } from "@/lib/checks-and-balances";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";

import { AdminTitle } from "./components";
import { ClientSidebarNav } from "./sidebar-nav";

export const metadata: Metadata = {
  title: "Forms",
  description: "Advanced form example using react-hook-form and Zod.",
};

const adminNavItems = [
  { title: "Admin", href: "/admin" },
  { title: "Users", href: "/admin/user" },
  { title: "Hosts", href: "/admin/host" },
  { title: "Properties", href: "/admin/property" },
  { title: "Retreats", href: "/admin/retreat" },
  { title: "Programs", href: "/admin/program" },
  { title: "Payments", href: "/admin/payment" },
  { title: "Bookings", href: "/admin/booking" },
  { title: "Offerings", href: "/admin/offering" },
];

const hostNavItems = [
  { title: "Admin", href: "/admin" },
  { title: "Hosts", href: "/admin/host" },
  { title: "Properties", href: "/admin/property" },
  { title: "Retreats", href: "/admin/retreat" },
  { title: "Programs", href: "/admin/program" },
  { title: "Payments", href: "/admin/payment" },
  { title: "Bookings", href: "/admin/booking" },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default async function SettingsLayout({
  children,
}: SettingsLayoutProps) {
  const session = await auth();

  if (!session || !canViewDashboard(session.user.role)) return redirect("/");
  const isHost = session.user.role === "host";
  return (
    <div className={cn(isHost ? "" : "")}>
      <div className="hidden space-y-6 p-10 pb-16 md:block">
        <AdminTitle isHost={isHost} />
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <ClientSidebarNav items={isHost ? hostNavItems : adminNavItems} />
          </aside>
          <div className="min-h-screen flex-1 lg:max-w-4xl">{children}</div>
          <Toaster />
        </div>
      </div>
    </div>
  );
}
