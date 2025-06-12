import { Injectable } from "@nestjs/common";
import { BookingResponseDto } from "../dto/booking-response.dto";
import { PaginatedBookingResponseDto } from "../dto/paginated-booking-response.dto";
import { QueryBookingDto } from "../dto/query-booking.dto";
import { Booking } from "../entities/booking.entity";
import { BookingMapper } from "../utils/booking.mapper";
import { BookingQueryOptions } from "../interfaces/booking-query-options.interface";

@Injectable()
export class BookingDtoService {
    public mapBookingToDto(booking: Booking, context: BookingQueryContext): BookingResponseDto {
        const dto = BookingMapper.toResponseDto(booking);
        
        this.addBusinessInfoIfNeeded(dto, booking, context);
        this.removeSensitiveDataIfNeeded(dto, booking, context);

        return dto;
    }

    public mapQueryDtoToOptions(query: QueryBookingDto): BookingQueryOptions {
        return {
            status: query.status,
            fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
            toDate: query.toDate ? new Date(query.toDate) : undefined,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            page: query.page,
            limit: query.limit
        };
    }

    public createPaginatedResponse(
        bookings: Booking[],
        total: number,
        options: BookingQueryOptions,
        context: BookingQueryContext
    ): PaginatedBookingResponseDto {
        return {
            data: bookings.map(booking => this.mapBookingToDto(booking, context)),
            page: options.page,
            limit: options.limit,
            total,
            totalPages: Math.ceil(total / options.limit),
            hasNext: options.page * options.limit < total,
            hasPrev: options.page > 1,
        };
    }

    private addBusinessInfoIfNeeded(
        dto: BookingResponseDto, 
        booking: Booking, 
        context: BookingQueryContext
    ): void {
        if (!context.isBusinessOwner && booking.serviceOffering?.business) {
            dto.business = {
                id: booking.serviceOffering.business.id,
                name: booking.serviceOffering.business.name,
                address: booking.serviceOffering.business.address
            };
        }
    }

    private removeSensitiveDataIfNeeded(
        dto: BookingResponseDto, 
        booking: Booking, 
        context: BookingQueryContext
    ): void {
        if (!context.canViewAllBookings && booking.userId !== context.userId) {
            delete dto.guestEmail;
            delete dto.guestPhone;
        }
    }
}