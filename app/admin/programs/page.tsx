import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// import { PropertyDataTable } from "./components";
// import { CreatePropertyForm } from "./create-property-form";

// import { PropertyList } from "./property-list";

export default function ProgramPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create Property</h3>
        <p className="text-sm text-muted-foreground">
          Properties belong to Hosts, Retreats & Programs are held at a Property
        </p>
      </div>
      <Separator className="my-6" />
      <Tabs defaultValue="list" className="">
        <TabsList>
          <TabsTrigger value="list">View Programs</TabsTrigger>
          <TabsTrigger value="form">Create Program</TabsTrigger>
        </TabsList>
        <TabsContent value="form">{/* <CreatePropertyForm /> */}</TabsContent>
        <TabsContent value="list">{/* <ProgramDataTable /> */}</TabsContent>
      </Tabs>
    </div>
  );
}
