// app/admin/host/page.tsx
import { getAuthenticatedUser } from "@/actions/auth-actions";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { HostDataTable } from "./data-table";
import { HostForm } from "./host-form";

export default async function HostPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create or Edit Host</h3>
        <p className="text-sm text-muted-foreground">
          Hosts can manage properties, retreats, and programs
        </p>
      </div>
      <Separator className="my-6" />
      <Tabs defaultValue="list" className="">
        <TabsList>
          <TabsTrigger value="list">View Hosts</TabsTrigger>
          <TabsTrigger value="form">Create Host</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          {user.data && <HostForm userId={user?.data.id} />}
        </TabsContent>
        <TabsContent value="list">
          <HostDataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
