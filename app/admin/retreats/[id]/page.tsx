import { ImageUpload } from "../../properties/image-form";
import { ImageGallery } from "../../properties/image-order-form";
import { RetreatForm } from "../retreat-form";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Retreat</h3>
        <p className="text-sm text-muted-foreground">Edit existing retreat.</p>
      </div>
      <hr className="max-w-lg" />
      <RetreatForm />
      <ImageUpload recordId={params.id} recordType="retreat" />
      <ImageGallery recordId={params.id} recordType="retreat" />
    </div>
  );
}
