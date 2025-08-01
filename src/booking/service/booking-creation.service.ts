import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from '../entities/booking.entity';
import { Repository } from 'typeorm';
import { SlotService } from 'src/slot/slot.service';
import { ServiceOfferingService } from 'src/service-offering/services/service-offering.service';
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
    throw Error('not implemented');
  }
}
