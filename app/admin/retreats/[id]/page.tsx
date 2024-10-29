import { getRetreat } from "@/actions/retreat-actions";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AmenitiesForm } from "../../amenity-form";
import { PriceModForm } from "../../price-mod-form";
import { ImageUpload } from "../../properties/image-form";
import { ImageGallery } from "../../properties/image-order-form";
import { RetreatInstanceForm } from "../instance-form";
import { RetreatForm } from "../retreat-form";
import { RetreatInstancesList } from "../retreat-instance-table";

export default async function Page({ params }: { params: { id: string } }) {
  const result = await getRetreat(params.id);

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Retreat</h3>
        <p className="text-sm text-muted-foreground">Edit existing retreat.</p>
      </div>

      <Tabs defaultValue="general" className="w-full max-w-2xl">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="prices">Pricing</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="instances">Instances</TabsTrigger>
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
              <div className="space-y-4">
                <ImageUpload recordId={params.id} recordType="retreat" />
                <div>
                  <h4 className="text-sm font-medium">Image Gallery</h4>
                  <ImageGallery recordId={params.id} recordType="retreat" />
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
              <CardTitle>Amenities</CardTitle>
              <CardDescription>
                Manage facilities and activities for this retreat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Facilities</h3>
                <AmenitiesForm
                  recordId={params.id}
                  recordType="retreat"
                  amenityType="facility"
                />
              </div>
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-medium">Activities</h3>
                <AmenitiesForm
                  recordId={params.id}
                  recordType="retreat"
                  amenityType="activity"
                />
              </div>
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
