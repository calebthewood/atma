import { getProgram } from "@/actions/program-actions";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { H2, H3 } from "@/components/typography";

import { AmenitiesEntityForm } from "../../amenities-entity-form";
import { PriceModForm } from "../../price-mod-form";
import { ImageUpload } from "../../properties/image-form";
import { ImageGallery } from "../../properties/image-order-form";
import { ProgramForm } from "../program-form";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const result = await getProgram(params.id);

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <H3>Edit Program</H3>
        <p className="text-sm text-muted-foreground">Edit existing program.</p>
      </div>
      <Tabs defaultValue="general" className="w-full max-w-2xl">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="prices">Pricing</TabsTrigger>
          <TabsTrigger value="amenities">Amenitites</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Manage the main program details and settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgramForm program={result.program} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>
                Upload, reorder, or remove program images.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <ImageUpload recordId={params.id} recordType="program" />
                <div>
                  <h4 className="text-sm font-medium">Image Gallery</h4>
                  <ImageGallery recordId={params.id} recordType="program" />
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
                Manage price adjustments and special rates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PriceModForm recordId={params.id} recordType="program" />
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
