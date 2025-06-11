import { ForbiddenException } from '@nestjs/common';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { BookingValidationException } from '../exceptions/booking.exceptions';
import { CreateBookingDto } from '../dto/create-booking.dto';

export class BookingValidator {
    static validateGuestBookingData(dto: CreateBookingDto, userId?: number): void {
        if (!userId && (!dto.guestName || !dto.guestEmail || !dto.guestPhone)) {
            throw new BookingValidationException('Guest information is required for unauthenticated bookings');
        }
    }

    static validateBookingTime(startDateTime: string): void {
        if (new Date(startDateTime) <= new Date()) {
            throw new BookingValidationException('Booking time must be in the future');
        }
    }

    static validateBookingAccess(booking: Booking, userId?: number, isBusinessOwner = false): void {
        if (!isBusinessOwner && booking.userId !== userId && userId) {
            throw new ForbiddenException('You can only access your own bookings');
        }
    }

    static validateStatusTransition(
        currentStatus: BookingStatus,
        newStatus: BookingStatus,
        isBusinessOwner: boolean,
    ): void {
        const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
            [BookingStatus.CREATED]: [BookingStatus.PENDING, BookingStatus.CANCELLED],
            [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
            [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
            [BookingStatus.COMPLETED]: [],
            [BookingStatus.CANCELLED]: [],
        };

        if (!allowedTransitions[currentStatus].includes(newStatus)) {
            throw new BookingValidationException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }

        if (newStatus === BookingStatus.CONFIRMED && !isBusinessOwner) {
            throw new ForbiddenException('Only business owners can confirm bookings');
        }
    }
}