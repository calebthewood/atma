import Link from "next/link";
import { getRetreat, getRetreatById } from "@/actions/retreat-actions";
import { Retreat } from "@prisma/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PriceModForm } from "../../../price-mod-form";
import { ImageManagement } from "../../../properties/image-management";
import { RetreatInstanceForm } from "../../instance-form";
import { RetreatForm } from "../../retreat-form";
import { RetreatInstancesList } from "../../retreat-instance-table";

export default async function Page(props: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const params = await props.params;
  const result = await getRetreatById(params.id);

  const tabs = [
    {
      value: "general",
      label: "General",
      href: `/admin/retreats/${params.id}/general`,
      component: () => (
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Manage retreat details, scheduling, and basic settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RetreatForm retreat={result} />
          </CardContent>
        </Card>
      ),
    },
    {
      value: "images",
      label: "Images",
      href: `/admin/retreats/${params.id}/images`,
      component: () => (
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>
              Upload and manage retreat images and gallery order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageManagement recordId={params.id} recordType="retreat" />
          </CardContent>
        </Card>
      ),
    },
    {
      value: "prices",
      label: "Pricing",
      href: `/admin/retreats/${params.id}/prices`,
      component: () => (
        <Card>
          <CardHeader>
            <CardTitle>Price Modifications</CardTitle>
            <CardDescription>
              Manage pricing variations, packages, and special rates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PriceModForm recordId={params.id} recordType="retreat" />
          </CardContent>
        </Card>
      ),
    },
    {
      value: "instances",
      label: "Instances",
      href: `/admin/retreats/${params.id}/instances`,
      component: () => (
        <>
          <RetreatInstancesList retreatId={params.id} />
          <Card>
            <CardHeader>
              <CardTitle>Retreat Instances</CardTitle>
              <CardDescription>
                Manage specific dates, availability, and bookings for this
                retreat.
              </CardDescription>
            </CardHeader>
            <CardContent></CardContent>
            <CardContent>
              <RetreatInstanceForm />
            </CardContent>
          </Card>
        </>
      ),
    },
  ];

  const Output = tabs.filter((t, i) => t.value === params.slug)[0].component;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Retreat</h3>
        <p className="text-sm text-muted-foreground">Edit existing retreat.</p>
      </div>

      <Tabs defaultValue={params.slug} className="w-full max-w-2xl">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} asChild value={tab.value}>
              <Link href={tab.href} className="relative" scroll={false}>
                {tab.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={params.slug}>
          <Output />
        </TabsContent>
      </Tabs>
    </div>
  );
}
