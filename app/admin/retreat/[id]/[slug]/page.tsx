import Link from "next/link";
import { getRetreat } from "@/actions/retreat-actions";
import { getPaginatedInstances } from "@/actions/retreat-instance-actions";

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

import { PriceModForm } from "../../../price-form";
import { ImageManagement } from "../../../property/image-management";
import { RetreatInstanceForm } from "../../instance-form";
import { PriceModsTable } from "../../instance-pricing-table";
import { RetreatForm } from "../../retreat-form";
import { RetreatInstancesList } from "../../retreat-instance-table";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const result = await getRetreat(resolvedParams.id);

  // Use new instance actions with proper error handling
  const instancesResponse = await getPaginatedInstances(
    1, // Start with first page
    10, // Page size
    resolvedParams.id
  );

  if (!instancesResponse.success) {
    console.error("Failed to load instances:", instancesResponse.error);
  }

  // Safely access data using the new response structure
  const instances = instancesResponse.success
    ? instancesResponse.data
    : { instances: [], totalPages: 0, currentPage: 1, totalInstances: 0 };

  const tabs = [
    {
      value: "general",
      label: "General",
      href: `/admin/retreat/${resolvedParams.id}/general`,
      component: () => (
        <>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Manage retreat details, scheduling, and basic settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RetreatForm retreat={result.data} />
          </CardContent>
        </>
      ),
    },
    {
      value: "images",
      label: "Images",
      href: `/admin/retreat/${resolvedParams.id}/images`,
      component: () => (
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>
              Upload and manage retreat images and gallery order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageManagement
              recordId={resolvedParams.id}
              recordType="retreat"
            />
          </CardContent>
        </Card>
      ),
    },
    {
      value: "instances",
      label: "Instances",
      href: `/admin/retreat/${resolvedParams.id}/instances`,
      component: () => (
        <>
          <RetreatInstancesList
            retreatId={resolvedParams.id}
            initialInstances={instances}
          />
          <RetreatInstanceForm />
        </>
      ),
    },
    {
      value: "prices",
      label: "Pricing",
      href: `/admin/retreat/${resolvedParams.id}/prices`,
      component: () => (
        <>
          <CardHeader>
            <CardTitle>Price Modifications</CardTitle>
            <CardDescription>
              Manage pricing variations, packages, and special rates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RetreatInstancesList
              retreatId={resolvedParams.id}
              initialInstances={instances}
            />
          </CardContent>
          <CardContent>
            <PriceModsTable />
          </CardContent>
          <CardContent>
            <PriceModForm />
          </CardContent>
        </>
      ),
    },
  ];

  const Output = tabs.find((t) => t.value === resolvedParams.slug)?.component;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Retreat</h3>
        <p className="text-sm text-muted-foreground">Edit existing retreat.</p>
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
