import { BookingResponseDto } from "../dto/booking-response.dto";
import { QueryBookingDto } from "../dto/query-booking.dto";
import { Booking, BookingStatus } from "../entities/booking.entity";
import { BookingQueryOptions } from "../interfaces/booking-query-options.interface";
import { BookingMapper } from "../utils/booking.mapper";
import { BookingDtoService } from "./booking-dto.service";

jest.mock('../utils/booking.mapper');

describe('BookingDtoService', () => {
    let service: BookingDtoService;

    beforeEach(() => {
        service = new BookingDtoService();
    });

    describe('mapBookingToDto', () => {
        const baseBooking: Booking = {
            id: 1,
            userId: 123,
            status: BookingStatus.CONFIRMED,
            createdAt: new Date(),
            updatedAt: new Date(),
            guestEmail: 'test@example.com',
            guestPhone: '+1234567890',
            guestName: 'Test Guest',
            slotId: 1,
            serviceOfferingId: 1,
            slot: null,
            serviceOffering: {
                id: 1,
                name: 'Haircut',
                durationMinutes: 60,
                price: 100,
                businessId: 1,
                business: {
                id: 1,
                name: 'Salon A',
                address: '123 Main St',
                },
                bookings: [],
            },
        } as any;

        const dtoWithSensitive: BookingResponseDto = {
            id: 1,
            userId: 123,
            status: BookingStatus.CONFIRMED,
            createdAt: baseBooking.createdAt.toISOString(),
            guestName: 'Test Guest',
            guestEmail: 'test@example.com',
            guestPhone: '+1234567890',
            serviceOffering: {
                id: 1,
                name: 'Haircut',
                duration: 60,
                price: 100,
            },
        };

        beforeEach(() => {
            (BookingMapper.toResponseDto as jest.Mock).mockReturnValue({ ...dtoWithSensitive });
        });

        it('should include business info if user is not business owner', () => {
            const context: BookingQueryContext = {
                isBusinessOwner: false,
                canViewAllBookings: true,
                userId: 456,
            };

            const result = service.mapBookingToDto(baseBooking, context);
            expect(result.business).toEqual({
                id: 1,
                name: 'Salon A',
                address: '123 Main St',
            });
        });

        it('should not include business info if user is business owner', () => {
            const context: BookingQueryContext = {
                isBusinessOwner: true,
                canViewAllBookings: true,
                userId: 456,
            };

            const result = service.mapBookingToDto(baseBooking, context);
            expect(result.business).toBeUndefined();
        });

        it('should remove sensitive data if user cannot view all and is not owner', () => {
            const context: BookingQueryContext = {
                isBusinessOwner: false,
                canViewAllBookings: false,
                userId: 999, // not booking.userId
            };

            const result = service.mapBookingToDto(baseBooking, context);
            expect(result.guestEmail).toBeUndefined();
            expect(result.guestPhone).toBeUndefined();
        });

        it('should not remove sensitive data if user can view all', () => {
            const context: BookingQueryContext = {
                isBusinessOwner: false,
                canViewAllBookings: true,
                userId: 999,
            };

            const result = service.mapBookingToDto(baseBooking, context);
            expect(result.guestEmail).toBe('test@example.com');
            expect(result.guestPhone).toBe('+1234567890');
        });

        it('should not remove sensitive data if user is the owner', () => {
            const context: BookingQueryContext = {
                isBusinessOwner: false,
                canViewAllBookings: false,
                userId: 123, // same as booking.userId
            };

            const result = service.mapBookingToDto(baseBooking, context);
            expect(result.guestEmail).toBe('test@example.com');
            expect(result.guestPhone).toBe('+1234567890');
        });
    });

    describe('mapQueryDtoToOptions', () => {
        it('should map query dto to options correctly', () => {
            const query: QueryBookingDto = {
                status: BookingStatus.CANCELLED,
                fromDate: '2025-06-01T00:00:00.000Z',
                toDate: '2025-06-30T23:59:59.000Z',
                sortBy: 'createdAt',
                sortOrder: 'DESC',
                page: 2,
                limit: 15,
            };

            const result = service.mapQueryDtoToOptions(query);
            expect(result).toEqual({
                status: BookingStatus.CANCELLED,
                fromDate: new Date('2025-06-01T00:00:00.000Z'),
                toDate: new Date('2025-06-30T23:59:59.000Z'),
                sortBy: 'createdAt',
                sortOrder: 'DESC',
                page: 2,
                limit: 15,
            });
        });

        it('should handle missing optional fields gracefully', () => {
            const query = {
                page: 1,
                limit: 10,
            } as QueryBookingDto;

            const result = service.mapQueryDtoToOptions(query);
            expect(result).toEqual({
                page: 1,
                limit: 10,
                status: undefined,
                fromDate: undefined,
                toDate: undefined,
                sortBy: undefined,
                sortOrder: undefined,
            });
        });
    });

    describe('createPaginatedResponse', () => {
        it('should create paginated response correctly', () => {
            const bookings = [{ id: 1 }, { id: 2 }] as Booking[];
            const context: BookingQueryContext = {
                isBusinessOwner: false,
                canViewAllBookings: true,
                userId: 123,
            };

            const options: BookingQueryOptions = {
                page: 2,
                limit: 2,
                sortOrder: 'ASC',
                sortBy: 'createdAt',
            };

            const total = 5;

            jest.spyOn(service, 'mapBookingToDto').mockImplementation((booking: Booking) => ({
                id: booking.id,
            }) as BookingResponseDto);

            const result = service.createPaginatedResponse(bookings, total, options, context);

            expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
            expect(result.page).toBe(2);
            expect(result.limit).toBe(2);
            expect(result.total).toBe(5);
            expect(result.totalPages).toBe(3);
            expect(result.hasNext).toBe(true);
            expect(result.hasPrev).toBe(true);
        });
    });
});