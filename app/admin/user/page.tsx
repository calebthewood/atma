import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { UsersDataTable } from "./data-table";
import { UserForm } from "./user-form";

export default function UsersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            View, create, and manage user accounts
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="list" className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list">User List</TabsTrigger>
            <TabsTrigger value="create">Create User</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="space-y-4">
          <UsersDataTable />
        </TabsContent>

        <TabsContent value="create">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6">
              <h3 className="text-lg font-medium">Create New User</h3>
              <p className="text-sm text-muted-foreground">
                Add a new user to the system
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <UserForm />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
