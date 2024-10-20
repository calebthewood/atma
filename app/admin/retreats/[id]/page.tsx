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
    </div>
  );
}
