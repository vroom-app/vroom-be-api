import { Injectable, Logger } from '@nestjs/common';
import { AvailableSlotsResponse } from './dtos/available-slots.dto';
import { ServiceOfferingService } from 'src/service-offering/services/service-offering.service';
import { BusinessOpeningHoursService } from 'src/business/services/business-opening-hours.service';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import {
  formatMinutes,
  getDatesBetween,
  Interval,
  parseTime,
  subtractInterval,
} from 'src/common/helpers/time.utils';
import { format } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';
import { Slot } from './entities/slot.entity';
import { Repository } from 'typeorm';
import { BusinessOpeningHours } from 'src/business/entities/business-opening-hours.entity';

@Injectable()
export class SlotService {
  private readonly logger = new Logger(SlotService.name);

  constructor(
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
    private readonly serviceOfferingService: ServiceOfferingService,
    private readonly openingHoursService: BusinessOpeningHoursService,
  ) {}

  /**
   * Get available slots for a specific service offering and date range.
   * @param businessId - ID of the business
   * @param serviceOfferingId - ID of the service offering
   * @param startDate - Start date for availability check
   * @param days - Number of days to check
   * @returns Array of available slots
   */
  async getAvailableSlots(
    businessId: string,
    serviceOfferingId: number,
    startDate: string,
    days: number,
  ): Promise<AvailableSlotsResponse[]> {
    // TODO: Implement logic to check availability and book a slot
    throw new Error('Method not implemented.');
  }

  public async checkAvailabilityAndBook(
    startDateTime: string,
    serviceOfferingId: number,
    duration: number,
  ): Promise<Slot> {
    // TODO: Implement logic to check availability and book a slot
    throw new Error('Method not implemented.');
  }

  /**
   * Get blocked slots for a specific day.
   * @param businessId - ID of the business
   * @param serviceOfferingId - ID of the service offering
   * @param date - Date to check for blocked slots
   * @param serviceCapacity - Capacity of the service offering
   * @returns Array of blocked intervals
   */
  private async getBlockedSlotsForDay(
    businessId: string,
    serviceOfferingId: number,
    date: string,
    serviceCapacity: number,
  ): Promise<Interval[]> {
    // Implement DB query to find slots where isBlocked=true or bookingsCount >= capacity
    const slots = await this.slotRepository.find({
      where: {
        businessId,
        offeringId: serviceOfferingId,
        date,
      },
    });

    if (!slots || slots.length === 0) {
      this.logger.debug(
        `No blocked slots found for business ${businessId} on ${date}`,
      );
      return [];
    }

    return slots
      .filter((slot) => slot.isBlocked || slot.bookingsCount >= serviceCapacity)
      .map((slot) => ({
        start: parseTime(slot.startTime),
        end: parseTime(slot.endTime),
      }));
  }

  /**
   * Subtract blocked intervals from free intervals.
   * @param freeIntervals - Array of free intervals
   * @param blocked - Array of blocked intervals
   * @returns Array of available intervals after subtraction
   */
  private subtractBlockedIntervals(
    freeIntervals: Interval[],
    blocked: Interval[],
  ): Interval[] {
    let result = [...freeIntervals];
    for (const block of blocked) {
      result = subtractInterval(result, block);
    }
    return result;
  }

  /**
   * Generate time slots based on available intervals and duration.
   * @param intervals - Array of available intervals
   * @param duration - Duration of each slot in minutes
   * @returns Array of time slots with start and end times
   */
  private generateTimeSlots(
    intervals: Interval[],
    duration: number,
  ): { start_time: string; end_time: string }[] {
    const slots: { start_time: string; end_time: string }[] = [];

    for (const interval of intervals) {
      let currentStart = interval.start;
      while (currentStart + duration <= interval.end) {
        const endTime = currentStart + duration;
        slots.push({
          start_time: formatMinutes(currentStart),
          end_time: formatMinutes(endTime),
        });
        currentStart += duration;
      }
    }

    return slots;
  }
}
