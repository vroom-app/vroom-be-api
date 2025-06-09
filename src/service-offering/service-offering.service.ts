import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ServiceOffering } from "./entities/service-offering.entity";
import { Repository } from "typeorm";
import { CreateServiceOfferingDto } from "./dtos/create-service-offering.dto";
import { Business } from "src/business/entities/business.entity";
import { UpdateServiceOfferingDto } from "src/business-management/dtos/business-offerings-update.dto";

@Injectable()
export class ServiceOfferingService {
    constructor(
        @InjectRepository(ServiceOffering)
        private serviceOfferingRepository: Repository<ServiceOffering>,
    ) {}

    /**
     * Create multiple service offerings
     * @param businessId The ID of the business
     * @param createServiceOfferingDtos Array of DTOs containing service offering data
     * @returns Array of created service offerings
     */
    async createMultiple(
        businessId: number,
        createServiceOfferingDtos: CreateServiceOfferingDto[]
    ): Promise<ServiceOffering[]> {
        const serviceOfferings = createServiceOfferingDtos.map(dto => 
            this.serviceOfferingRepository.create({
                ...dto,
                business: { id: businessId } as Business,
            })
        );
        
        return this.serviceOfferingRepository.save(serviceOfferings);
    }

    /**
     * Update a service offering by ID
     * @param id The ID of the service offering to update
     * @param updateServiceOfferingDto DTO containing updated service offering data
     * @returns The updated service offering
     * @throws NotFoundException if service offering doesn't exist
     */
    async update(
        serviceId: number, 
        updateServiceOfferingDto: Partial<UpdateServiceOfferingDto>
    ): Promise<ServiceOffering> {
        const result = await this.serviceOfferingRepository.update(
            serviceId, 
            updateServiceOfferingDto
        );

        if (result.affected === 0) {
            throw new NotFoundException(`Service offering with ID ${serviceId} not found`);
        }

        return {
            id: serviceId,
            ...updateServiceOfferingDto
        } as ServiceOffering;
    }

    /**
     * Delete a service offering by ID and business ID
     * @param serviceOfferingId The ID of the service offering to delete
     * @param businessId The ID of the business
     * @returns True if deletion was successful
     * @throws NotFoundException if service offering doesn't exist
     */
    async deleteServiceOfferingByIdAndBusinessId(
        serviceOfferingId: number,
        businessId: number
    ): Promise<boolean> {
        const result = await this.serviceOfferingRepository.delete({
            id: serviceOfferingId,
            businessId: businessId,
        });

        if (result.affected === 0) {
            throw new NotFoundException(`Service offering with ID ${serviceOfferingId} not found`);
        }

        return true;
    }

    /**
     * Find a service offering by ID
     * @param id The ID of the service offering to find
     * @returns The found service offering
     * @throws NotFoundException if service offering doesn't exist
     */
    async findById(id: number): Promise<ServiceOffering> {
        const serviceOffering = await this.serviceOfferingRepository.findOne({
            where: { id },
        });

        if (!serviceOffering) {
            throw new NotFoundException(`Service offering with ID ${id} not found`);
        }

        return serviceOffering;
    }
}