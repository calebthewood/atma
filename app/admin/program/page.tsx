import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProgramDataTable } from "./data-table";
import { ProgramForm } from "./program-form";

export default function ProgramPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create or Edit Property</h3>
        <p className="text-muted-foreground text-sm">
          Programs are similar to Retreats. Held at a Property, should have Host
        </p>
      </div>
      <Separator className="my-6" />
      <Tabs defaultValue="list" className="">
        <TabsList>
          <TabsTrigger value="list">View Programs</TabsTrigger>
          <TabsTrigger value="form">Create Program</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <ProgramForm />
        </TabsContent>
        <TabsContent value="list">
          <ProgramDataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
