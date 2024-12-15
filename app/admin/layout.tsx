import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/actions/user-actions";
import { auth } from "@/auth";

import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";

import { AdminTitle } from "./components";
import { ClientSidebarNav } from "./sidebar-nav";

export const metadata: Metadata = {
  title: "Forms",
  description: "Advanced form example using react-hook-form and Zod.",
};

const sidebarNavItems = [
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

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default async function SettingsLayout({
  children,
}: SettingsLayoutProps) {
  const session = await auth();
  if (!session || !session.user || !session.user.email)
    return redirect("/authentication");
  const email = session.user.email;
  const fullUser = await getUser({ email });
  if (!fullUser || fullUser.role !== "admin") return redirect("/");

  return (
    <>
      <div className="hidden space-y-6 p-10 pb-16 md:block">
        <AdminTitle />
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <ClientSidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-4xl">{children}</div>
          <Toaster />
        </div>
      </div>
    </>
  );
}
