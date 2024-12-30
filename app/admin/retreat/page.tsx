import { Separator } from "@/components/ui/separator";

import { RetreatDataTable } from "./data-table";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create or Edit Retreat</h3>
        <p className="text-sm text-muted-foreground">
          Retreats are held at Properties, and should have a Host
        </p>
      </div>
      <Separator className="my-6" />
      <RetreatDataTable />
    </div>
  );
}
