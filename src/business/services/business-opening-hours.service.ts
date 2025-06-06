import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessOpeningHours } from '../entities/business-opening-hours.entity';

@Injectable()
export class BusinessOpeningHoursService {
    constructor(
        @InjectRepository(BusinessOpeningHours)
        private openingHoursRepository: Repository<BusinessOpeningHours>
    ) {}

    /**
     * Get all opening hours for a business
     * @param businessId The ID of the business
     * @returns Array of opening hours
     */
    async findByBusinessId(
        businessId: number
    ): Promise<BusinessOpeningHours[]> {
        return this.openingHoursRepository.find({
            where: { businessId },
            order: { dayOfWeek: 'ASC' }
        });
    }

    /**
     * Create opening hours for a business
     * @param businessId The ID of the business
     * @param openingHours Array of opening hours data
     * @returns Created opening hours
     */
    async createForBusiness(
        businessId: number, 
        openingHours: Array<{ dayOfWeek: number; opensAt: string; closesAt: string }>
    ): Promise<BusinessOpeningHours[]> {
        const openingHoursEntities = openingHours.map(hours => 
            this.openingHoursRepository.create({
                ...hours,
                businessId
            })
        );
        
        return this.openingHoursRepository.save(openingHoursEntities);
    }

    /**
     * Update opening hours for a business
     * This removes all existing hours and creates new ones
     * @param businessId The ID of the business
     * @param openingHours Array of opening hours data
     * @returns Updated opening hours
     */
    async updateForBusiness(
        businessId: number, 
        openingHours: Array<{ dayOfWeek: number; opensAt: string; closesAt: string }>
    ): Promise<BusinessOpeningHours[]> {
        const existingHours = await this.findByBusinessId(businessId);

        if (existingHours.length > 0) {
            await this.openingHoursRepository.remove(existingHours);
        }
        
        return this.createForBusiness(businessId, openingHours);
    }
}