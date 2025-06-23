interface BookingQueryContext {
  userId?: number;
  businessId?: string;
  isBusinessOwner: boolean;
  canViewAllBookings: boolean;
}
