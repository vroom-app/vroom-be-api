import { BadRequestException, ConflictException, Inject, Injectable, Logger } from "@nestjs/common";
import { BookingResponseDto } from "./dto/booking-response.dto";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { QueryBookingDto } from "./dto/query-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { PaginatedBookingResponseDto } from "./dto/paginated-booking-response.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Booking, BookingStatus } from "./entities/booking.entity";
import { Repository } from "typeorm";
import { BookingValidator } from "./utils/booking.validator";
import { SlotService } from "src/slot/slot.service";
import { ServiceOfferingService } from "src/service-offering/service-offering.service";
import { BookingMapper } from "./utils/booking.mapper";
import { BookingConflictException, BookingValidationException } from "./exceptions/booking.exceptions";

@Injectable()
export class BookingService {
    private readonly logger = new Logger(BookingService.name);
    
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        private readonly slotService: SlotService,
        private readonly serviceOfferingService: ServiceOfferingService,
    ) {}

    public async create(createBookingDto: CreateBookingDto, userId?: number): Promise<BookingResponseDto> {
        this.logger.log(`Creating booking for user: ${userId || 'guest'}`);

        BookingValidator.validateGuestBookingData(createBookingDto, userId);
        BookingValidator.validateBookingTime(createBookingDto.startDateTime);

        try {
            // Begin transaction
            const queryRunner = this.bookingRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                // Get service details
                const serviceDetails = await this.serviceOfferingService.findById(createBookingDto.serviceOfferingId);
                
                // Check availability and book slot
                const slot = await this.slotService.checkAvailabilityAndBook(
                    createBookingDto.startDateTime,
                    createBookingDto.serviceOfferingId,
                    serviceDetails.durationMinutes
                );

                const booking = this.bookingRepository.create({
                    userId: userId || undefined,
                    serviceOfferingId: createBookingDto.serviceOfferingId,
                    slotId: slot.id,
                    status: BookingStatus.CREATED,
                    specialRequests: createBookingDto.specialRequests,
                    guestName: createBookingDto.guestName,
                    guestEmail: createBookingDto.guestEmail,
                    guestPhone: createBookingDto.guestPhone,
                });
                
                const savedBooking = await queryRunner.manager.save(booking);
                
                await queryRunner.commitTransaction();

                this.logger.log(`Booking created successfully with ID: ${savedBooking.id}`);
                
                return BookingMapper.toResponseDto(savedBooking);
            } catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            } finally {
                await queryRunner.release();
            }
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
    public async findAll(query: QueryBookingDto, userId?: number, isBusinessOwner?: boolean, businessId?: number): Promise<PaginatedBookingResponseDto> {
        this.logger.log(`Fetching bookings for user: ${userId}, business: ${businessId}`);
        throw new Error("Method not implemented.");
    }
    public async findOne(id: number, userId?: number, isBusinessOwner?: boolean): Promise<BookingResponseDto> {
        this.logger.log(`Fetching booking with ID: ${id}`);
        throw new Error("Method not implemented.");
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
}