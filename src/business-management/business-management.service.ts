import { ForbiddenException, Injectable } from "@nestjs/common";
import { BusinessProfileDto } from "./dtos/business-profile.dto";
import { BusinessService } from "src/business/services/business.service";
import { ServiceOfferingService } from "src/service-offering/service-offering.service";
import { CreateBusinessDto } from "src/business/dtos/create-business.dto";
import { CreateServiceOfferingDto } from "src/service-offering/dtos/create-service-offering.dto";
import { Business } from "src/business/entities/business.entity";
import { ServiceOffering } from "src/service-offering/entities/service-offering.entity";
import { UpdateBusinessServicesDto, UpdateServiceOfferingDto } from "./dtos/business-offerings-update.dto";
import { UpdateBusinessDetailsDto } from "./dtos/business-details-update.dto";

@Injectable()
export class BusinessManagementService {
    constructor(
        private readonly businessService: BusinessService,
        private readonly serviceOfferingService: ServiceOfferingService,
    ) {}

    /**
     * Get a business profile by ID
     * 
     * @param businessId The ID of the business
     * @returns The business profile including services
     * @throws NotFoundException if business doesn't exist
     */
    async getBusinessProfile(
        businessId: number,
        userId: number
    ): Promise<BusinessProfileDto> {
        return await this.businessService.getBusinessProfile(businessId, userId);
    }

    /**
     * Create a business and its associated services
     * 
     * @param userId The ID of the user creating the business
     * @param createBusinessDto The DTO containing business
     * @returns The created business
     */
    async createBusiness(
        userId: number,
        createBusinessDto: CreateBusinessDto,
    ) {
        return await this.businessService.createBusiness(userId, createBusinessDto);
    }

    /**
     * Update a business and its associated services
     * 
     * @param userId The ID of the user updating the business
     * @param businessId The ID of the business to update
     * @param createServiceOfferingDto The DTO containing service data
     * @returns The updated business
     * @throws NotFoundException if business doesn't exist
     * @throws ForbiddenException if user is not the owner
     */
    async addBusinessServiceOfferings(
        userId: number,
        businessId: number,
        createServiceOfferingDto: CreateServiceOfferingDto[]
    ) {
        if (await this.businessService.isOwnedByUser(userId, businessId)) {
            const serviceOfferings = await this.serviceOfferingService.createMultiple(
                businessId,
                createServiceOfferingDto
            );
            return serviceOfferings;
        }

        throw new ForbiddenException("You are not the owner of this business");
    }

    /**
     * Update business details including basic info and opening hours
     * 
     * @param userId The ID of the user updating the business
     * @param businessId The ID of the business to update
     * @param updateBusinessDetailsDto The DTO containing business update data
     * @returns The updated business
     * @throws NotFoundException if business doesn't exist
     * @throws ForbiddenException if user is not the owner
     */
    async updateBusinessDetails(
        userId: number,
        businessId: number,
        updateBusinessDetailsDto: UpdateBusinessDetailsDto
    ): Promise<Business> {
        if (await this.businessService.isOwnedByUser(userId, businessId)) {
            return await this.businessService.updateBusiness(
                businessId, 
                updateBusinessDetailsDto
            );
        }

        throw new ForbiddenException("You are not the owner of this business");
    }

    /**
     * Update multiple service offerings for a business
     * 
     * @param userId The ID of the user updating the services
     * @param businessId The ID of the business 
     * @param updateBusinessServicesDto The DTO containing service update data
     * @returns The updated service offerings
     * @throws NotFoundException if business/service doesn't exist
     * @throws ForbiddenException if user is not the owner
     */
    async updateBusinessServices(
        userId: number,
        businessId: number,
        updateBusinessServicesDto: UpdateBusinessServicesDto
    ): Promise<ServiceOffering[]> {
        if (await this.businessService.isOwnedByUser(userId, businessId)) {
            const updatedServices = await Promise.all(
                updateBusinessServicesDto.services.map((serviceDto: UpdateServiceOfferingDto) => 
                    this.serviceOfferingService.update(serviceDto.id, serviceDto)
                )
            );
            return updatedServices;
        }
        throw new ForbiddenException("You are not the owner of this business");
    }

    /**
     * Delete a service offering
     * 
     * @param userId The ID of the user
     * @param businessId The ID of the business to which the service offering belongs
     * @param serviceOfferingId The ID of the service offering to delete
     * @param updateServiceOfferingDto The DTO containing updated service data
     * @throws NotFoundException if business doesn't exist
     * @returns The updated service offering
     */
    async deleteServiceOffering(
        userId: number,
        businessId: number,
        serviceOfferingId: number
    ): Promise<boolean> {  
        if (await this.businessService.isOwnedByUser(userId, businessId)) {
            return await this.serviceOfferingService.deleteServiceOfferingByIdAndBusinessId(
                serviceOfferingId,
                businessId
            );
        }
        throw new ForbiddenException("You are not the owner of this business");
    }

    /**
     * Delete {@link Business} and its {@link ServiceOffering}, {@link BusinessSpecialization} and {@link BusinessOpeningHours}
     * 
     * @param id The ID of the business to delete
     * @param userId The ID of the user attempting the deletion
     * @returns True if deletion was successful
     * @throws NotFoundException if business doesn't exist
     * @throws ForbiddenException if user is not the owner
     */
    async deleteBusinessAndServices(businessId: number, userId: number): Promise<boolean> {
        return await this.businessService.deleteBusinessByIdAndUserId(businessId, userId);
    }
}