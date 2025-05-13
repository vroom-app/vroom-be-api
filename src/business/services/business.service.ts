import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { CreateBusinessDto } from "../dtos/create-business.dto";
import { Business } from "../entities/business.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { BusinessProfileDto } from "src/business-management/dtos/business-profile.dto";
import { UpdateBusinessDetailsDto } from "src/business-management/dtos/business-details-update.dto";

@Injectable()
export class BusinessService {
    constructor(
        @InjectRepository(Business)
        private businessRepository: Repository<Business>
    ) {}

    /**
     * Get all businesses owned by a specific user
     * @param userId The ID of the user
     * @returns Array of businesses owned by the user
     */
    async getAllUserBusinesses(userId: number): Promise<Business[]> {
        return this.businessRepository.find({
            where: { 
                ownerId: userId 
            },
            order: {
                createdAt: 'DESC',
            },
            relations: ['openingHours', 'specializations.specialization']
        });
    }

    /**
     * Get a business profile by ID
     * 
     * @param businessId The ID of the business
     * @param userId The ID of the user requesting the profile
     * @returns The business profile including services, specializations, and opening hours
     * @throws NotFoundException if business doesn't exist
     */
    async getBusinessProfile(
        businessId: number,
        userId: number
    ): Promise<BusinessProfileDto> {
        const business = await this.businessRepository.findOne({
            where: { 
                id: businessId,
                ownerId: userId
            },
            relations: {
                openingHours: true,
                specializations: {
                    specialization: true
                },
                serviceOfferings: true
            }
        });

        if (!business) {
            throw new NotFoundException(`Business with ID ${businessId} not found`);
        }

        return {
            id: business.id,
            name: business.name,
            description: business.description,
            address: business.address,
            city: business.city,
            phone: business.phone,
            website: business.website || undefined,
            isVerified: business.isVerified,
            
            openingHours: business.openingHours.map(hour => ({
                dayOfWeek: hour.dayOfWeek,
                opensAt: hour.opensAt,
                closesAt: hour.closesAt
            })),
            
            specializations: business.specializations.map(bs => ({
                id: bs.specialization.id,
                name: bs.specialization.name
            })),
            
            services: business.serviceOfferings.map(service => ({
                id: service.id,
                name: service.name,
                description: service.description,
                price: service.price,
                priceType: service.priceType,
                durationMinutes: service.durationMinutes,
                category: service.category || undefined
            }))
        };
    }
    
    /**
     * Validates if an user is the owner of a business
     * @param userId The ID of the user
     * @param businessId The ID of the business
     * @returns If business is found and owned by the user
     * @throws NotFoundException if business doesn't exist
     */
    async isOwnedByUser(
        userId: number,
        businessId: number
    ): Promise<boolean> {
        const business = await this.businessRepository.findOne({
            where: { id: businessId },
            select: ['id', 'ownerId'],
        });

        if (!business) {
            throw new NotFoundException(`Business with ID ${businessId} not found`);
        }

        return business.ownerId === userId;
    }

    /**
     * Create a new business for a user
     * @param userId The ID of the user creating the business
     * @param createBusinessDto DTO containing business data
     * @returns The created business
     */
    async createBusiness(userId: number, createBusinessDto: CreateBusinessDto): Promise<Business> {
        const { openingHours, ...businessData } = createBusinessDto;
        
        const business = this.businessRepository.create({
            ...businessData,
            ownerId: userId,
            coordinates: this.createPointFromCoordinates(createBusinessDto.latitude, createBusinessDto.longitude)
        });
        
        return await this.businessRepository.save(business);
    }

    /**
     * Update a business if the user is the owner
     * @param id The ID of the business to update
     * @param updateBusinessDto DTO containing updated business data
     * @returns The updated business
     * @throws NotFoundException if business doesn't exist
     * @throws ForbiddenException if user is not the owner
     */
    async updateBusiness(
        id: number, 
        updateBusinessDto: UpdateBusinessDetailsDto
    ): Promise<Business> {
        const { openingHours, ...businessData } = updateBusinessDto;

        const result = await this.businessRepository.update(id, businessData);

        if (result.affected === 0) {
            throw new NotFoundException(`Business with ID ${id} not found`);
        }

        const updatedBusiness = await this.businessRepository.findOne({
            where: { id },
            relations: ['openingHours']
        });

        if (!updatedBusiness) {
            throw new NotFoundException(`Business with ID ${id} not found`);
        }

        return updatedBusiness;
    }

    /**
     * Delete a business if the user is the owner
     * 
     * @param id The ID of the business to delete
     * @param userId The ID of the user attempting the deletion
     * @returns True if deletion was successful
     * @throws NotFoundException if business doesn't exist
     * @throws ForbiddenException if user is not the owner
     */
    async deleteBusinessByIdAndUserId(id: number, userId: number): Promise<boolean> {
        const business = await this.findById(id);
        
        if (business.ownerId !== userId) {
            throw new ForbiddenException('You do not have permission to delete this business');
        }
        
        const result = await this.businessRepository.remove(business);
        return !!result;
    }
    
    /**
     * Create a GeoJSON Point from latitude and longitude
     * @param latitude The latitude coordinate
     * @param longitude The longitude coordinate
     * @returns GeoJSON Point object uses [longitude, latitude] order
     */
    private createPointFromCoordinates(latitude: number, longitude: number) {
        return `(${longitude},${latitude})`;
    }

    /**
     * Find a business by ID
     * @param id The ID of the business
     * @returns The found business
     * @throws NotFoundException if business doesn't exist
     */
    async findById(id: number): Promise<Business> {
        const business = await this.businessRepository.findOne({
            where: { id },
        });

        if (!business) {
            throw new NotFoundException(`Business with ID ${id} not found`);
        }

        return business;
    }
}