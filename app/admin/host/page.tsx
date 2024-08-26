import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CreateHostForm } from "./create-host-form";
import { HostList } from "./host-list";

export default function Page() {
  return (
    <div className="">
      <h3 className="text-lg font-medium">Create New Host</h3>
      <p className="text-sm text-muted-foreground">
        Form allows admin user to create a new host
      </p>
      <Separator className="my-6" />
      <Tabs defaultValue="form" className="">
        <TabsList>
          <TabsTrigger value="form">Create Host</TabsTrigger>
          <TabsTrigger value="list">View Hosts</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <CreateHostForm />
        </TabsContent>
        <TabsContent value="list">
          <HostList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
