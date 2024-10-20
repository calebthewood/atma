import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PropertyDataTable } from "./components";
import { CreatePropertyForm } from "./create-property-form";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create or Edit Property</h3>
        <p className="text-sm text-muted-foreground">
          Properties belong to Hosts, Retreats & Programs are held at a Property
        </p>
      </div>
      <Tabs defaultValue="list" className="">
        <TabsList>
          <TabsTrigger value="list">View Properties</TabsTrigger>
          <TabsTrigger value="form">Create Property</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <CreatePropertyForm />
        </TabsContent>
        <TabsContent value="list">
          <PropertyDataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
