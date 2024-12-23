export interface BookingData {
  propertyId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  userId: string;
  retreatInstanceId: string;
}
