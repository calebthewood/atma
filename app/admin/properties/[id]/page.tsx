import { getProperty } from "@/actions/property-actions";

import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AmenitiesEntityForm } from "../../amenities-entity-form";
import { PriceModForm } from "../../price-mod-form";
import { ImageUpload } from "../image-form";
import { ImageGallery } from "../image-order-form";
import { PropertyForm } from "../property-form";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const property = await getProperty(params.id);

  const result = await prisma.amenity.updateMany({
    where: {
      type: "facility",
    },
    data: {
      type: "amenity",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Property</h3>
        <p className="text-sm text-muted-foreground">Edit existing property.</p>
      </div>

      <Tabs defaultValue="general" className="w-full max-w-2xl">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="prices">Pricing</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
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
              <PropertyForm property={property} />
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
              <div className="space-y-4">
                <ImageUpload recordId={params.id} recordType="property" />
                <div>
                  <h4 className="text-sm font-medium">Image Gallery</h4>
                  <ImageGallery recordId={params.id} recordType="property" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prices">
          <Card>
            <CardHeader>
              <CardTitle>Price Modifications</CardTitle>
              <CardDescription>
                Manage seasonal rates, special offers, and price adjustments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PriceModForm recordId={params.id} recordType="property" />
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
                recordType="property"
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
                recordType="property"
                amenityType="activity"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
