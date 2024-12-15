import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PropertyDataTable } from "./data-table";
import { PropertyForm } from "./property-form";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create or Edit Property</h3>
        <p className="text-muted-foreground text-sm">
          Properties belong to Hosts, Retreats & Programs are held at a Property
        </p>
      </div>
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">View Properties</TabsTrigger>
          <TabsTrigger value="form">Create Property</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <PropertyForm />
        </TabsContent>
        <TabsContent value="list">
          <PropertyDataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
