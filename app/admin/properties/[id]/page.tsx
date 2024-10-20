import { PropertyEditForm } from "./edit-form";

export default function Page({ params }: { params: { id: string } }) {
  return (
        <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Property</h3>
        <p className="text-sm text-muted-foreground">
          Edit existing property.
        </p>
      </div>
      <hr className="max-w-lg"/>
      <PropertyEditForm propertyId={params.id} />
    </div>
  );
}
