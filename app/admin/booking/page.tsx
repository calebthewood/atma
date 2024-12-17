import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BookingList } from "./booking-list";
import { CreateBookingForm } from "./create-booking-form";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create Booking</h3>
        <p className="text-sm text-muted-foreground">
          This admin booking form is primarily for testing.
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="form" className="">
        <TabsList>
          <TabsTrigger value="form">Create Booking</TabsTrigger>
          <TabsTrigger value="list">View Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <CreateBookingForm />
        </TabsContent>
        <TabsContent value="list">
          <BookingList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
