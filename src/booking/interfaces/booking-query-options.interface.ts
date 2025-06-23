import { BookingStatus } from '../entities/booking.entity';

export interface BookingQueryOptions {
  status?: BookingStatus;
  fromDate?: Date;
  toDate?: Date;
  sortBy?: 'createdAt' | 'slotStartTime' | 'status';
  sortOrder?: 'ASC' | 'DESC';
  page: number;
  limit: number;
}
