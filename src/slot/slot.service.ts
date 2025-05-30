import { Injectable, Logger } from "@nestjs/common";
import { AvailableSlotsResponse } from "./dtos/available-slots.dto";
import { ServiceOfferingService } from "src/service-offering/service-offering.service";
import { BusinessOpeningHoursService } from "src/business/services/business-opening-hours.service";
import { ServiceOffering } from "src/service-offering/entities/service-offering.entity";
import { formatMinutes, getDatesBetween, Interval, parseTime, subtractInterval } from "src/common/helpers/time.utils";
import { format } from 'date-fns';
import { InjectRepository } from "@nestjs/typeorm";
import { Slot } from "./entities/slot.entity";
import { Repository } from "typeorm";
import { BusinessOpeningHours } from "src/business/entities/business-opening-hours.entity";

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
        businessId: number,
        serviceOfferingId: number,
        startDate: string,
        days: number,
    ): Promise<AvailableSlotsResponse[]> {
        const serviceOffering: ServiceOffering = await this.serviceOfferingService.findById(serviceOfferingId);
        const searchDates: Date[] = getDatesBetween(startDate, days);

        const results: AvailableSlotsResponse[] = [];

        for (const date of searchDates) {
            const dayOfWeek: number = date.getDay();
            const openingHours: BusinessOpeningHours | null =
                await this.openingHoursService.findBusinessWorktimeForWeekday(businessId, dayOfWeek);

            if (!openingHours) {
                this.logger.warn(`No opening hours found for business ${businessId} on ${format(date,'yyyy-MM-dd')}`);
                continue;
            }

            const opensAt: number = parseTime(openingHours.opensAt);
            const closesAt: number = parseTime(openingHours.closesAt);
            let availableIntervals: Interval[] = [{ start: opensAt, end: closesAt }];

            // Fetch all blocked/booked slots for the day
            const blockedSlots = await this.getBlockedSlotsForDay(
                businessId,
                serviceOfferingId,
                format(date, 'yyyy-MM-dd'),
            );

            // Subtract blocked intervals from free slots
            availableIntervals = this.subtractBlockedIntervals(
                availableIntervals,
                blockedSlots,
            );

            // Generate concrete slot times based on offering duration
            const duration = serviceOffering.durationMinutes;
            const availableSlots = this.generateTimeSlots(
                availableIntervals,
                duration,
            );

            if (availableSlots.length > 0) {
                results.push({
                date: format(date, 'yyyy-MM-dd'),
                business_id: businessId,
                service_offering_id: serviceOfferingId,
                available_slots: availableSlots,
                });
            }
        }

        return results;
    }

    /**
     * Get blocked slots for a specific day.
     * @param businessId - ID of the business
     * @param serviceOfferingId - ID of the service offering
     * @param date - Date to check for blocked slots
     * @returns Array of blocked intervals
     */
    private async getBlockedSlotsForDay(
        businessId: number,
        serviceOfferingId: number,
        date: string,
    ): Promise<Interval[]> {
        // Implement DB query to find slots where isBlocked=true or bookingsCount >= capacity
        const slots = await this.slotRepository.find({
        where: {
            businessId,
            offeringId: serviceOfferingId,
            date,
        },
        });

        return slots
        .filter(
            (slot) => slot.isBlocked || slot.bookingsCount >= slot.capacity,
        )
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
        // TODO: Loop through each blocked interval and subtract
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
