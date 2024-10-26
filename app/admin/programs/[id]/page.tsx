import { getProgram } from "@/actions/program-actions";

import { H2, H3 } from "@/components/typography";

import { ImageUpload } from "../../properties/image-form";
import { ImageGallery } from "../../properties/image-order-form";
import { ProgramForm } from "../program-form";

export default async function Page({ params }: { params: { id: string } }) {
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
      <hr className="max-w-lg" />
      <ProgramForm program={result.program} />
      <hr />
      <ImageUpload recordId={params.id} recordType="program" />
      <ImageGallery recordId={params.id} recordType="program" />
    </div>
  );
}
