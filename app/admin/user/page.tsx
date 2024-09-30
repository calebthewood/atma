import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CreateUserForm } from "./create-user-form";
import { UserList } from "./user-list";
import { ImageUploadForm } from "./image-upload";

export default function Page() {
  return (
    <div className="">
      <h3 className="text-lg font-medium">Create User</h3>
      <p className="text-sm text-muted-foreground">
        Create user, can be Admin, User, or Host
      </p>

      <Separator className="my-6" />
      <Tabs defaultValue="form" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="form">Create User</TabsTrigger>
          <TabsTrigger value="list">View Users</TabsTrigger>
          <TabsTrigger value="img">Upload Image</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <CreateUserForm />
        </TabsContent>
        <TabsContent value="list">
          <UserList />
        </TabsContent>
        <TabsContent value="img">
          <ImageUploadForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
