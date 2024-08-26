export interface BookingData {
  propertyId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  totalPrice: number;
  status: string;
  userId: string;
  retreatInstanceId: string;
}
