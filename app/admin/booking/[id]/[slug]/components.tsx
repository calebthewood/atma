import { BookingWithDetails } from "@/actions/booking-actions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailProps {
  booking: BookingWithDetails;
}

export function BookingDetails({ booking }: DetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Check-in Date</p>
            <p>{new Date(booking.checkInDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Check-out Date</p>
            <p>{new Date(booking.checkOutDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Guest Count</p>
            <p>{booking.guestCount}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Price</p>
            <p>${booking.totalPrice}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Status</p>
            <p>{booking.status}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Created At</p>
            <p>{new Date(booking.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InstanceDetails({ booking }: DetailProps) {
  const instance = booking.retreatInstance || booking.programInstance;
  const type = booking.retreatInstance ? "Retreat" : "Program";
  const name =
    booking.retreatInstance?.retreat.name ||
    booking.programInstance?.program.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type} Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Name</p>
          <p>{name}</p>
        </div>
        {/* Add more instance details as needed */}
      </CardContent>
    </Card>
  );
}

export function PropertyDetails({ booking }: DetailProps) {
  const property =
    booking.retreatInstance?.retreat.property ||
    booking.programInstance?.program.property;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {property ? (
          <>
            <div>
              <p className="text-sm font-medium">Name</p>
              <p>{property.name}</p>
            </div>
            {/* Add more property details as needed */}
          </>
        ) : (
          <p>No property information available</p>
        )}
      </CardContent>
    </Card>
  );
}

export function UserDetails({ booking }: DetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Name</p>
          <p>{booking.user.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Email</p>
          <p>{booking.user.email}</p>
        </div>
        {/* Add more user details as needed */}
      </CardContent>
    </Card>
  );
}

export function PaymentDetails({ booking }: DetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        {booking.payments.length > 0 ? (
          <div className="space-y-4">
            {booking.payments.map((payment, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p>{new Date(payment.paymentDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Amount</p>
                    <p>${payment.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p>{payment.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No payment records found</p>
        )}
      </CardContent>
    </Card>
  );
}
