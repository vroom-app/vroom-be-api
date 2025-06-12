import { BadRequestException, ConflictException, Injectable, Logger } from "@nestjs/common";
import { BookingResponseDto } from "../dto/booking-response.dto";
import { CreateBookingDto } from "../dto/create-booking.dto";
import { QueryBookingDto } from "../dto/query-booking.dto";
import { UpdateBookingDto } from "../dto/update-booking.dto";
import { PaginatedBookingResponseDto } from "../dto/paginated-booking-response.dto";
import { BookingValidator } from "../utils/booking.validator";
import { BookingMapper } from "../utils/booking.mapper";
import { BookingConflictException, BookingValidationException } from "../exceptions/booking.exceptions";
import { BookingQueryService } from "./booking-query.service";
import { BookingDtoService } from "./booking-dto.service";
import { BookingQueryOptions } from "../interfaces/booking-query-options.interface";
import { BookingCreationService } from "./booking-creation.service";
import { BusinessService } from "src/business/services/business.service";

@Injectable()
export class BookingService {
    private readonly logger = new Logger(BookingService.name);
    
    constructor(
        private readonly bookingQueryService: BookingQueryService,
        private readonly bookingDtoService: BookingDtoService,
        private readonly bookingTransactionService: BookingCreationService,
        private readonly businessService: BusinessService,
    ) {}

    /**
     * Creates a new booking.
     * @param createBookingDto - The data required to create a booking.
     * @param userId - Optional user ID for authenticated users, undefined for guests.
     * @returns The created booking as a BookingResponseDto.
     */
    public async create(createBookingDto: CreateBookingDto, userId?: number): Promise<BookingResponseDto> {
        this.logger.log(`Creating booking for user: ${userId || 'guest'}`);

        // Validation
        BookingValidator.validateGuestBookingData(createBookingDto, userId);
        BookingValidator.validateBookingTime(createBookingDto.startDateTime);

        try {
            const savedBooking = await this.bookingTransactionService.createBookingWithTransaction(
                createBookingDto, 
                userId
            );
            
            return BookingMapper.toResponseDto(savedBooking);

        } catch (error) {
            this.logger.error(`Failed to create booking: ${error.message}`, error.stack);
            
            if (error instanceof BookingValidationException) {
                throw new BadRequestException(error.message);
            }
            if (error instanceof BookingConflictException) {
                throw new ConflictException(error.message);
            }
            
            throw new BadRequestException(`Failed to create booking: ${error.message}`);
        }
    }

    public async findUserBookings(
        query: QueryBookingDto, 
        userId: number
    ): Promise<PaginatedBookingResponseDto> {
        this.logger.log(`Fetching bookings for user: ${userId}`);
        
        const context = this.createUserBookingContext(userId);
        const options = this.bookingDtoService.mapQueryDtoToOptions(query);

        return this.executeBookingQuery(options, context);
    }

    public async findBusinessBookings(
        query: QueryBookingDto, 
        businessId: number, 
        userId: number
    ): Promise<PaginatedBookingResponseDto> {
        this.logger.log(`Fetching bookings for business: ${businessId} by user: ${userId}`);
        
        // Verify business ownership/access
        await this.businessService.isOwnedByUser(userId, businessId);
        
        const context = this.createBusinessBookingContext(userId, businessId);
        const options = this.bookingDtoService.mapQueryDtoToOptions(query);

        return this.executeBookingQuery(options, context);
    }

    public async update(id: number, updateBookingDto: UpdateBookingDto, userId?: number, isBusinessOwner?: boolean): Promise<BookingResponseDto> {
        this.logger.log(`Updating booking ${id} for user: ${userId}`);
        throw new Error("Method not implemented.");
    }
    public async cancel(id: number, userId?: number, isBusinessOwner?: boolean): Promise<BookingResponseDto> {
        this.logger.log(`Cancelling booking ${id} for user: ${userId}`);
        throw new Error("Method not implemented.");
    }
    public async confirm(id: number, businessId: number): Promise<BookingResponseDto> {
        this.logger.log(`Confirming booking ${id} for business: ${businessId}`);
        throw new Error("Method not implemented.");
    }
    
    private async executeBookingQuery(
        options: BookingQueryOptions,
        context: BookingQueryContext
    ): Promise<PaginatedBookingResponseDto> {
        const { bookings, total } = await this.bookingQueryService.findBookingsWithPagination(
            options, 
            context
        );
        
        return this.bookingDtoService.createPaginatedResponse(bookings, total, options, context);
    }

    private createUserBookingContext(userId: number): BookingQueryContext {
        return {
            userId,
            isBusinessOwner: false,
            canViewAllBookings: false
        };
    }

    private createBusinessBookingContext(userId: number, businessId: number): BookingQueryContext {
        return {
            userId,
            businessId,
            isBusinessOwner: true,
            canViewAllBookings: true
        };
    }
}
