import { PropertyEditForm } from "./edit-form";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div>
      <PropertyEditForm propertyId={params.id} />
    </div>
  );
}
