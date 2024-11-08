import Link from "next/link";
import { getRetreat } from "@/actions/retreat-actions";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AmenitiesEntityForm } from "../../../amenities-entity-form";
import { PriceModForm } from "../../../price-mod-form";
import { ImageManagement } from "../../../properties/image-management";
import { RetreatInstanceForm } from "../../instance-form";
import { RetreatForm } from "../../retreat-form";
import { RetreatInstancesList } from "../../retreat-instance-table";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const result = await getRetreat(params.id, false);

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  const tabs = [
    {
      value: "general",
      label: "General",
      href: `/admin/retreats/${params.id}/general`,
    },
    {
      value: "images",
      label: "Images",
      href: `/admin/retreats/${params.id}/images`,
    },
    {
      value: "prices",
      label: "Pricing",
      href: `/admin/retreats/${params.id}/prices`,
    },
    {
      value: "amenities",
      label: "Amenities",
      href: `/admin/retreats/${params.id}/amenities`,
    },
    {
      value: "activities",
      label: "Activities",
      href: `/admin/retreats/${params.id}/activities`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Retreat</h3>
        <p className="text-sm text-muted-foreground">Edit existing retreat.</p>
      </div>

      <Tabs defaultValue="general" className="w-full max-w-2xl">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} asChild value={tab.value}>
              <Link href={tab.href} className="relative" scroll={false}>
                {tab.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Manage retreat details, scheduling, and basic settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RetreatForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
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
        </TabsContent>

        <TabsContent value="prices">
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
        </TabsContent>

        <TabsContent value="amenities">
          <Card>
            <CardHeader>
              <CardTitle>Property Amenities</CardTitle>
              <CardDescription>
                Manage available facilities and amenities for this property.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AmenitiesEntityForm
                recordId={params.id}
                recordType="retreat"
                amenityType="amenity"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Property Activities</CardTitle>
              <CardDescription>
                Manage available activities and experiences for this property.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AmenitiesEntityForm
                recordId={params.id}
                recordType="retreat"
                amenityType="activity"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instances">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
