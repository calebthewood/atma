import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { RetreatDataTable } from "./data-table";
import { RetreatForm } from "./retreat-form";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create Retreat</h3>
        <p className="text-sm text-muted-foreground">
          Must be associated with a Host and a Property, will need more details
          & properties
        </p>
      </div>
      <Separator className="my-6" />

      <Tabs defaultValue="form" className="">
        <TabsList>
          <TabsTrigger value="form">Create Retreat</TabsTrigger>
          <TabsTrigger value="list">View Retreats</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <RetreatForm />
        </TabsContent>
        <TabsContent value="list">
          <RetreatDataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
