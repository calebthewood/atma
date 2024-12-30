import { Separator } from "@/components/ui/separator";

import { ProgramDataTable } from "./data-table";

export default function ProgramPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create or Edit Property</h3>
        <p className="text-sm text-muted-foreground">
          Programs are similar to Retreats. Held at a Property, should have Host
        </p>
      </div>
      <Separator className="my-6" />
      <ProgramDataTable />
    </div>
  );
}
