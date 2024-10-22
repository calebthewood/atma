import { getProperty } from "@/actions/property-actions";

import { ImageUpload } from "../image-form";
import { ImageGallery } from "../image-order-form";
import { PropertyForm } from "../property-form";

export default async function Page({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Property</h3>
        <p className="text-sm text-muted-foreground">Edit existing property.</p>
      </div>
      <hr className="max-w-lg" />
      <PropertyForm property={property} />
      <hr />
      <ImageUpload recordId={params.id} recordType="property" />
      <ImageGallery recordId={params.id} recordType="property" />
    </div>
  );
}
