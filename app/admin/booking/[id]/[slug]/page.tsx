// app/admin/booking/[id]/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getAdminBooking } from "@/actions/booking-actions";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  BookingDetails,
  InstanceDetails,
  PaymentDetails,
  PropertyDetails,
  UserDetails,
} from "./components";

export default async function Page(props: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await props.params;
  const result = await getAdminBooking(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const booking = result.data;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">
          Booking Details - {booking.user.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          View booking information and related details
        </p>
      </div>
      <Separator />
      <Tabs defaultValue={slug} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Overview</TabsTrigger>
          <TabsTrigger value="instance">
            {booking.retreatInstance ? "Retreat" : "Program"}
          </TabsTrigger>
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <BookingDetails booking={booking} />
        </TabsContent>
        <TabsContent value="instance">
          <InstanceDetails booking={booking} />
        </TabsContent>
        <TabsContent value="property">
          <PropertyDetails booking={booking} />
        </TabsContent>
        <TabsContent value="user">
          <UserDetails booking={booking} />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentDetails booking={booking} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
