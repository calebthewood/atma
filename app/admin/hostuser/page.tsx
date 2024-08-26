import { Separator } from "@/components/ui/separator";

import { CreateHostUserForm } from "./create-host-user-form";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create Host-User</h3>
        <p className="text-sm text-muted-foreground">
          Basically an account manager, they&apos;re users allowed to create
          Retreats and Properties on behalf of a Host.
        </p>
      </div>
      <Separator />
      <CreateHostUserForm />
    </div>
  );
}
