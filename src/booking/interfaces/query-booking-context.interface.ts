interface BookingQueryContext {
    userId?: number;
    businessId?: number;
    isBusinessOwner: boolean;
    canViewAllBookings: boolean;
}