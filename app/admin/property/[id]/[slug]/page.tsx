import { ReactNode, Suspense } from "react";
import Link from "next/link";
import { getProperty } from "@/actions/property-actions";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AmenitiesEntityForm } from "../../../amenities-entity-form";
import { ImageManagement } from "../../image-management";
import { PropertyForm } from "../../property-form";

// Loading placeholder for forms
const FormSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-12 w-3/4" />
  </div>
);

// Tab content wrapper with loading state
const TabContentWrapper = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<FormSkeleton />}>{children}</Suspense>
);

export default async function Page(props: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const params = await props.params;
  const res = await getProperty(params?.id, ["published", "draft", "archived"]);

  const tabs = [
    {
      value: "general",
      label: "General",
      href: `/admin/property/${params?.id}/general`,
    },
    {
      value: "images",
      label: "Images",
      href: `/admin/property/${params?.id}/images`,
    },
    {
      value: "amenities",
      label: "Amenities",
      href: `/admin/property/${params?.id}/amenities`,
    },
    {
      value: "activities",
      label: "Activities",
      href: `/admin/property/${params?.id}/activities`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Property</h3>
        <p className="text-sm text-muted-foreground">Edit existing property.</p>
      </div>

      <Tabs defaultValue={params.slug} className="w-full">
        <TabsList>
          {tabs.map((tab, i) => (
            <TabsTrigger key={i + tab.value} asChild value={tab.value}>
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
                Manage the property details, policies, and settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TabContentWrapper>
                <PropertyForm property={res.data} />
              </TabContentWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>
                Upload and manage property images and gallery order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <TabContentWrapper>
                <ImageManagement recordId={params?.id} recordType="property" />
              </TabContentWrapper>
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
              <TabContentWrapper>
                <AmenitiesEntityForm
                  recordId={params?.id}
                  recordType="property"
                  amenityType="amenity"
                />
              </TabContentWrapper>
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
              <TabContentWrapper>
                <AmenitiesEntityForm
                  recordId={params?.id}
                  recordType="property"
                  amenityType="activity"
                />
              </TabContentWrapper>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
