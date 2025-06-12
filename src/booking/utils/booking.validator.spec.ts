import { BookingValidator } from './booking.validator';
import { BookingValidationException } from '../exceptions/booking.exceptions';
import { ForbiddenException } from '@nestjs/common';
import { BookingStatus } from '../entities/booking.entity';
import { CreateBookingDto } from '../dto/create-booking.dto';

describe('BookingValidator', () => {
    describe('validateGuestBookingData', () => {
        it('should throw if guest info is missing and user is unauthenticated', () => {
            const dto: CreateBookingDto = {
                guestName: '',
                guestEmail: '',
                guestPhone: '',
            } as CreateBookingDto;

            expect(() => BookingValidator.validateGuestBookingData(dto)).toThrow(BookingValidationException);
        });

        it('should not throw if user is authenticated', () => {
            const dto = {} as CreateBookingDto;
            expect(() => BookingValidator.validateGuestBookingData(dto, 123)).not.toThrow();
        });

        it('should not throw if guest info is provided for guest booking', () => {
            const dto: CreateBookingDto = {
                guestName: 'John Doe',
                guestEmail: 'john@example.com',
                guestPhone: '1234567890',
            } as CreateBookingDto;

            expect(() => BookingValidator.validateGuestBookingData(dto)).not.toThrow();
        });
    });

    describe('validateBookingTime', () => {
        it('should throw if date is in the past', () => {
            const pastDate = new Date(Date.now() - 10000).toISOString();
            expect(() => BookingValidator.validateBookingTime(pastDate)).toThrow(BookingValidationException);
        });

        it('should not throw if date is in the future', () => {
            const futureDate = new Date(Date.now() + 100000).toISOString();
            expect(() => BookingValidator.validateBookingTime(futureDate)).not.toThrow();
        });
    });

    describe('validateBookingAccess', () => {
        const booking = { userId: 1 } as any;

        it('should throw if user is not owner or business owner', () => {
            expect(() => BookingValidator.validateBookingAccess(booking, 2)).toThrow(ForbiddenException);
        });

        it('should not throw if user is the booking owner', () => {
            expect(() => BookingValidator.validateBookingAccess(booking, 1)).not.toThrow();
        });

        it('should not throw if business owner is accessing', () => {
            expect(() => BookingValidator.validateBookingAccess(booking, undefined, true)).not.toThrow();
        });
    });

    describe('validateStatusTransition', () => {
        it('should throw on invalid transition', () => {
            expect(() =>
                BookingValidator.validateStatusTransition(BookingStatus.CREATED, BookingStatus.CONFIRMED, true),
            ).toThrow(BookingValidationException);
        });

        it('should not throw on valid transition', () => {
            expect(() =>
                BookingValidator.validateStatusTransition(BookingStatus.CREATED, BookingStatus.PENDING, true),
            ).not.toThrow();
        });

        it('should throw if non-owner confirms', () => {
            expect(() =>
                BookingValidator.validateStatusTransition(BookingStatus.PENDING, BookingStatus.CONFIRMED, false),
            ).toThrow(ForbiddenException);
        });

        it('should not throw if owner confirms', () => {
            expect(() =>
                BookingValidator.validateStatusTransition(BookingStatus.PENDING, BookingStatus.CONFIRMED, true),
            ).not.toThrow();
        });
    });
});