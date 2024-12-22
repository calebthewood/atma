import { getDashboardUser } from "@/actions/user-actions";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CreateBookingForm } from "./create-booking-form";
import { BookingsDataTable } from "./data-table";

export default async function Page() {
  const userResponse = await getDashboardUser();
  if (!userResponse.ok) {
    return null;
  }
  const isAdmin = userResponse.data?.role === "admin";

  const hostId = isAdmin ? "system" : userResponse.data?.hostUsers[0]?.hostId;

  if (!hostId) {
    return (
      <div className="text-red-500">
        No host association found for this user
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create Booking</h3>
        <p className="text-sm text-muted-foreground">
          This admin booking form is primarily for testing.
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="list" className="">
        <TabsList>
          <TabsTrigger value="list">View Bookings</TabsTrigger>
          <TabsTrigger value="form">Create Booking</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <CreateBookingForm />
        </TabsContent>
        <TabsContent value="list">
          <BookingsDataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
