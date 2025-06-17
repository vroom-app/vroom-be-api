import { ForbiddenException } from '@nestjs/common';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { BookingValidationException } from '../exceptions/booking.exceptions';
import { CreateBookingDto } from '../dto/create-booking.dto';

export class BookingValidator {
  static validateGuestBookingData(
    dto: CreateBookingDto,
    userId?: number,
  ): void {
    if (!userId && (!dto.guestName || !dto.guestEmail || !dto.guestPhone)) {
      throw new BookingValidationException(
        'Guest information is required for unauthenticated bookings',
      );
    }
  }

  /**
   * Validates that the booking start time is in the future.
   * @param startDateTime - The start date and time of the booking in ISO format.
   * @throws BookingValidationException if the start time is not in the future.
   */
  static validateBookingTime(startDateTime: string): void {
    if (new Date(startDateTime) <= new Date()) {
      throw new BookingValidationException(
        'Booking time must be in the future',
      );
    }
  }

  /**
   * Validates that the user has access to the booking.
   * @param booking - The booking object to validate.
   * @param userId - The ID of the user trying to access the booking.
   * @param isBusinessOwner - Whether the user is a business owner.
   * @throws ForbiddenException if the user does not have access.
   */
  static validateBookingAccess(
    booking: Booking,
    userId?: number,
    isBusinessOwner = false,
  ): void {
    if (!isBusinessOwner && booking.userId !== userId && userId) {
      throw new ForbiddenException('You can only access your own bookings');
    }
  }

  /**
   * Validates the transition between booking statuses.
   * @param currentStatus - The current status of the booking.
   * @param newStatus - The new status to transition to.
   * @param isBusinessOwner - Whether the user is a business owner.
   * @throws BookingValidationException if the transition is invalid.
   * @throws ForbiddenException if a non-business owner tries to confirm a booking.
   */
  static validateStatusTransition(
    currentStatus: BookingStatus,
    newStatus: BookingStatus,
    isBusinessOwner: boolean,
  ): void {
    const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.CREATED]: [BookingStatus.PENDING, BookingStatus.CANCELLED],
      [BookingStatus.PENDING]: [
        BookingStatus.CONFIRMED,
        BookingStatus.CANCELLED,
      ],
      [BookingStatus.CONFIRMED]: [
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
      ],
      [BookingStatus.COMPLETED]: [],
      [BookingStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw new BookingValidationException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }

    if (newStatus === BookingStatus.CONFIRMED && !isBusinessOwner) {
      throw new ForbiddenException('Only business owners can confirm bookings');
    }
  }
}
