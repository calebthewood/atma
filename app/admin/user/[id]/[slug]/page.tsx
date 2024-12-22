// app/admin/user/[id]/[slug]/page.tsx
import Link from "next/link";
import { getAuthenticatedUser } from "@/actions/auth-actions";
import { getUserWithRelations } from "@/actions/user-actions";

import { UserFormData } from "@/types/shared";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { UserForm } from "../../user-form";
import { HostUserForm } from "../../host-user-form";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const res = await getUserWithRelations({ id: resolvedParams?.id });
  const userRes = await getAuthenticatedUser();
  const adminUser = userRes.data;
  if (!res.ok || !res.data || !adminUser) {
    return <div>Error loading user: {res.message}</div>;
  }

  const user = res.data;

  // Transform the data to match the form's expected shape
  const formData: UserFormData = {
    role: user.role as "user" | "host" | "admin",
    name: user.name,
    status: user.status as
      | "active"
      | "inactive"
      | "suspended"
      | "deleted"
      | "archived",
    image: user.image ?? "",
    fname: user.fname ?? "",
    lname: user.lname ?? "",
    username: user.username ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    hostUsers:
      user?.hostUsers?.map((hu) => ({
        hostId: hu.hostId,
        permissions: hu.permissions,
        companyRole: hu.companyRole,
      })) || [],
  };

  const tabs = [
    {
      value: "general",
      label: "General",
      href: `/admin/user/${resolvedParams?.id}/general`,
      component: () => (
        <>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Manage user details, role, and account settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm userId={resolvedParams?.id} initialData={formData} />
          </CardContent>
        </>
      ),
    },
    {
      value: "hosts",
      label: "Hosts",
      href: `/admin/user/${resolvedParams?.id}/hosts`,
      component: () => (
        <Card>
          <CardHeader>
            <CardTitle>Host Associations</CardTitle>
            <CardDescription>
              Manage user's host relationships and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HostUserForm
              subjectUserId={resolvedParams.id}
              adminUserId={adminUser.id}
            />
          </CardContent>
        </Card>
      ),
    },
    {
      value: "bookings",
      label: "Bookings",
      href: `/admin/user/${resolvedParams?.id}/bookings`,
      component: () => (
        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
            <CardDescription>View and manage user's bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add BookingsTable component here */}
            <p>Bookings table coming soon</p>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "activity",
      label: "Activity",
      href: `/admin/user/${resolvedParams?.id}/activity`,
      component: () => (
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>
              View user's reviews, messages, and notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add ActivityLog component here */}
            <p>Activity log coming soon</p>
          </CardContent>
        </Card>
      ),
    },
  ];

  const Output = tabs.find((t) => t.value === resolvedParams.slug)?.component;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit User</h3>
        <p className="text-sm text-muted-foreground">
          {user.name} ({user.email})
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <NavigationMenu>
          <NavigationMenuList className="inline-flex items-center justify-center rounded-lg bg-muted p-1">
            {tabs.map((tab) => (
              <NavigationMenuItem key={tab.value}>
                <Link
                  href={tab.href}
                  legacyBehavior
                  passHref
                  scroll={false}
                  prefetch
                >
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "w-24 bg-muted",
                      "data-[active]:bg-primary-foreground data-[active]:font-semibold data-[active]:shadow"
                    )}
                    active={tab.value === resolvedParams.slug}
                  >
                    {tab.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="mt-4">{Output && <Output />}</div>
      </div>
    </div>
  );
}
