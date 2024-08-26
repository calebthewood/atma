import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CreatePropertyForm } from "./create-property-form";
import { PropertyList } from "./property-list";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create Property</h3>
        <p className="text-sm text-muted-foreground">
          A Host may have multiple properties, retreats are held at a property
        </p>
      </div>
      <Separator className="my-6" />
      <Tabs defaultValue="form" className="">
        <TabsList>
          <TabsTrigger value="form">Create Property</TabsTrigger>
          <TabsTrigger value="list">View Properties</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <CreatePropertyForm />
        </TabsContent>
        <TabsContent value="list">
          <PropertyList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
