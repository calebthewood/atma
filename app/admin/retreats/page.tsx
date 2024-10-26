import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { RetreatDataTable } from "./data-table";
import { RetreatForm } from "./retreat-form";

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

      <Tabs defaultValue="list" className="">
        <TabsList>
          <TabsTrigger value="list">View Retreats</TabsTrigger>
          <TabsTrigger value="form">Create Retreat</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <RetreatForm />
        </TabsContent>
        <TabsContent value="list">
          {/* <RetreatDataTable /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
