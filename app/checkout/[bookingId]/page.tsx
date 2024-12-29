import { getBooking } from "@/actions/booking-actions";
import { Calendar, MapPin, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const bookingRes = await getBooking(bookingId);
  const booking = bookingRes.data;

  if (!booking) {
    throw new Error("Booking not found");
  }
  // Get property and experience details from either retreat or program
  const property = booking.property;

  const experienceName =
    booking.retreatInstance?.retreat.name ||
    booking.programInstance?.program.name;

  if (!property) {
    throw new Error("Property not found");
  }

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">
              Booking Confirmation
            </CardTitle>
            <p className="mt-2">Booking ID: {booking?.id}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Property Section */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Location</h3>
              <div className="space-y-2 rounded p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-1 size-5 text-primary" />
                  <div>
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm">{property.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Experience Section */}
            {experienceName && (
              <>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Experience Details</h3>
                  <div className="rounded p-4">
                    <p className="font-medium">{experienceName}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Stay Details */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Stay Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <div>
                    <p className="text-sm">Check-in</p>
                    <p className="font-medium">
                      {booking.checkInDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <div>
                    <p className="text-sm">Check-out</p>
                    <p className="font-medium">
                      {booking.checkOutDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Guest & Price Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Number of Guests</p>
                  <p className="font-medium">
                    {booking.guestCount}{" "}
                    {booking.guestCount === 1 ? "guest" : "guests"}
                  </p>
                </div>
              </div>

              <div className="rounded p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total Price</span>
                  <span className="text-2xl font-bold text-primary">
                    ${booking.totalPrice}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Booking Status */}
            <div>
              <p className="text-sm text-gray-500">Booking Status</p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </span>
            </div>
          </CardContent>

          <CardFooter className="text-center text-sm">
            <p className="w-full">
              Questions or concerns? Contact us at{" "}
              <a
                href="mailto:support@yourdomain.com"
                className="text-primary hover:text-primary/80"
              >
                support@yourdomain.com
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
