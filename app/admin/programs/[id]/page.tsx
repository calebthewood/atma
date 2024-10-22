import { getProgram } from "@/actions/program-actions";

import { ProgramForm } from "../program-form";

export default async function Page({ params }: { params: { id: string } }) {
  const result = await getProgram(params.id);

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Program</h3>
        <p className="text-sm text-muted-foreground">Edit existing program.</p>
      </div>
      <hr className="max-w-lg" />
      <ProgramForm program={result.program} />
    </div>
  );
}
