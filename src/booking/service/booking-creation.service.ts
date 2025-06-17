import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { Repository } from 'typeorm';
import { SlotService } from 'src/slot/slot.service';
import { ServiceOfferingService } from 'src/service-offering/service-offering.service';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Injectable()
export class BookingCreationService {
  private readonly logger = new Logger(BookingCreationService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly slotService: SlotService,
    private readonly serviceOfferingService: ServiceOfferingService,
  ) {}

  async createBookingWithTransaction(
    createBookingDto: CreateBookingDto,
    userId?: number,
  ): Promise<Booking> {
    const queryRunner =
      this.bookingRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const serviceDetails = await this.serviceOfferingService.findById(
        createBookingDto.serviceOfferingId,
      );

      const slot = await this.slotService.checkAvailabilityAndBook(
        createBookingDto.startDateTime,
        createBookingDto.serviceOfferingId,
        serviceDetails.durationMinutes,
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

      this.logger.log(
        `Booking created successfully with ID: ${savedBooking.id}`,
      );
      return savedBooking;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Transaction failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
