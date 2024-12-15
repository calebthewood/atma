import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AmenityForm } from "./amenity-form";
import { AmenityList } from "./amenity-table";

export default function AmenityPage() {
  return (
    <div className="">
      <h3 className="text-lg font-medium">Create New Offering</h3>
      <p className="text-muted-foreground text-sm">
        Form allows admin user to create a new Amenity or Activity item
      </p>
      <Separator className="my-6" />
      <Tabs defaultValue="form" className="">
        <TabsList>
          <TabsTrigger value="form">Create Offering</TabsTrigger>
          <TabsTrigger value="list">View Offerings</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <AmenityForm />
        </TabsContent>
        <TabsContent value="list">
          <AmenityList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
