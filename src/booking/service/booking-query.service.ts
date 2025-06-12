import { Repository, SelectQueryBuilder } from "typeorm";
import { Booking } from "../entities/booking.entity";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BookingQueryOptions } from "../interfaces/booking-query-options.interface";

@Injectable()
export class BookingQueryService {
    private readonly logger = new Logger(BookingQueryService.name);

    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
    ) {}

    async findBookingsWithPagination(
        options: BookingQueryOptions,
        context: BookingQueryContext
    ): Promise<{ bookings: Booking[]; total: number }> {
        const queryBuilder = this.buildBookingsQuery(options, context);
        return await queryBuilder.getManyAndCount().then(([bookings, total]) => ({
            bookings,
            total
        }));
    }

    private buildBookingsQuery(
        options: BookingQueryOptions,
        context: BookingQueryContext
    ): SelectQueryBuilder<Booking> {
        const queryBuilder = this.bookingRepository.createQueryBuilder('booking')
            .leftJoinAndSelect('booking.slot', 'slot')
            .leftJoinAndSelect('booking.serviceOffering', 'serviceOffering')
            .leftJoinAndSelect('serviceOffering.business', 'business');

        this.applyAccessControls(queryBuilder, context);
        this.applyFilters(queryBuilder, options);
        this.applySortingAndPagination(queryBuilder, options);

        return queryBuilder;
    }

    private applyAccessControls(
        queryBuilder: SelectQueryBuilder<Booking>,
        context: BookingQueryContext
    ): void {
        if (context.businessId) {
            queryBuilder.where('business.id = :businessId', { businessId: context.businessId });
        } else if (context.userId) {
            queryBuilder.where('booking.userId = :userId', { userId: context.userId });
        }
    }

    private applyFilters(
        queryBuilder: SelectQueryBuilder<Booking>,
        options: BookingQueryOptions
    ): void {
        if (options.status) {
            queryBuilder.andWhere('booking.status = :status', { status: options.status });
        }

        if (options.fromDate) {
            queryBuilder.andWhere('slot.startTime >= :fromDate', { 
                fromDate: options.fromDate 
            });
        }

        if (options.toDate) {
            queryBuilder.andWhere('slot.startTime <= :toDate', { 
                toDate: options.toDate 
            });
        }
    }

    private applySortingAndPagination(
        queryBuilder: SelectQueryBuilder<Booking>,
        options: BookingQueryOptions
    ): void {
        const sortField = this.getSortField(options.sortBy);
        queryBuilder.orderBy(sortField, options.sortOrder || 'DESC');

        queryBuilder
            .skip((options.page - 1) * options.limit)
            .take(options.limit);
    }

    private getSortField(sortBy?: string): string {
        switch (sortBy) {
            case 'slotStartTime':
                return 'slot.startTime';
            case 'status':
                return 'booking.status';
            default:
                return 'booking.createdAt';
        }
    }
}