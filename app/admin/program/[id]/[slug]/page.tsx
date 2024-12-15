import Link from "next/link";
import { getProgram } from "@/actions/program-actions";
import { getPaginatedInstances } from "@/actions/program-instance-actions";

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
import { PriceModsTable } from "@/app/admin/retreat/instance-pricing-table";

import { PriceModForm } from "../../../price-form";
import { ImageManagement } from "../../../property/image-management";
import { ProgramForm } from "../../program-form";
import { ProgramInstanceForm } from "../../program-instance-form";
import { ProgramInstancesList } from "../../program-instance-table";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const programResponse = await getProgram(resolvedParams.id);

  if (!programResponse.success || !programResponse.data) {
    console.error("Failed to fetch program:", programResponse.error);
    return null; // Or handle error appropriately
  }

  const instancesResponse = await getPaginatedInstances(
    1, // Start with first page
    10, // Page size
    resolvedParams.id
  );

  const instances = instancesResponse.success
    ? instancesResponse.data
    : { instances: [], totalPages: 0, currentPage: 1, totalInstances: 0 };

  const tabs = [
    {
      value: "general",
      label: "General",
      href: `/admin/program/${resolvedParams.id}/general`,
      component: () => (
        <>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Manage program details, scheduling, and basic settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgramForm program={programResponse.data} />
          </CardContent>
        </>
      ),
    },
    {
      value: "images",
      label: "Images",
      href: `/admin/program/${resolvedParams.id}/images`,
      component: () => (
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>
              Upload and manage program images and gallery order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageManagement
              recordId={resolvedParams.id}
              recordType="program"
            />
          </CardContent>
        </Card>
      ),
    },
    {
      value: "instances",
      label: "Instances",
      href: `/admin/program/${resolvedParams.id}/instances`,
      component: () => (
        <>
          <ProgramInstancesList
            programId={resolvedParams.id}
            initialInstances={instances}
          />
          <ProgramInstanceForm />
        </>
      ),
    },
    {
      value: "prices",
      label: "Pricing",
      href: `/admin/program/${resolvedParams.id}/prices`,
      component: () => (
        <>
          <CardHeader>
            <CardTitle>Price Modifications</CardTitle>
            <CardDescription>
              Manage pricing variations, packages, and special rates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgramInstancesList
              programId={resolvedParams.id}
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
        <h3 className="text-lg font-medium">Edit Program</h3>
        <p className="text-sm text-muted-foreground">Edit existing program.</p>
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
