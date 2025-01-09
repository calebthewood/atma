import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AmenityForm } from "./amenity-form";
import { AmenityList } from "./amenity-table";

export default async function AmenityPage() {
  const session = await auth();
  if (!session) redirect("/");
  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="">
      <h3 className="text-lg font-medium">Create New Offering</h3>
      <p className="text-sm text-muted-foreground">
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
