import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ServiceOffering } from "./entities/service-offering.entity";
import { Repository } from "typeorm";
import { CreateServiceOfferingDto } from "./dtos/create-service-offering.dto";
import { UpdateServiceOfferingDto } from "./dtos/update-service-offering.dto";

@Injectable()
export class ServiceOfferingService {
    constructor(
        @InjectRepository(ServiceOffering)
        private serviceOfferingRepository: Repository<ServiceOffering>,
    ) {}

    /**
     * Get service offerings by business ID
     * @param businessId The ID of the business
     * @returns Array of service offerings for the business
     */
    async findByBusinessId(businessId: number): Promise<ServiceOffering[]> {
        return this.serviceOfferingRepository.find({
            where: { businessId },
            order: {
                createdAt: 'DESC',
            },
        });
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

    /**
     * Create a new service offering
     * @param createServiceOfferingDto DTO containing service offering data
     * @returns The created service offering
     * @throws NotFoundException if the business doesn't exist
     */
    async create(createServiceOfferingDto: CreateServiceOfferingDto): Promise<ServiceOffering> {
        const serviceOffering = this.serviceOfferingRepository.create(createServiceOfferingDto);
        return this.serviceOfferingRepository.save(serviceOffering);
    }

    /**
     * Create multiple service offerings
     * @param createServiceOfferingDtos Array of DTOs containing service offering data
     * @returns Array of created service offerings
     */
    async createMultiple(createServiceOfferingDtos: CreateServiceOfferingDto[]): Promise<ServiceOffering[]> {
        const serviceOfferings = createServiceOfferingDtos.map(dto => 
            this.serviceOfferingRepository.create(dto)
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
    async update(id: number, updateServiceOfferingDto: UpdateServiceOfferingDto): Promise<ServiceOffering> {
        const serviceOffering = await this.findById(id);
        
        const updatedServiceOffering = {
            ...serviceOffering,
            ...updateServiceOfferingDto,
        };

        return this.serviceOfferingRepository.save(updatedServiceOffering);
    }

    /**
     * Delete a service offering by ID
     * @param id The ID of the service offering to delete
     * @returns True if deletion was successful
     * @throws NotFoundException if service offering doesn't exist
     */
    async delete(id: number): Promise<boolean> {
        const serviceOffering = await this.findById(id);
        
        const result = await this.serviceOfferingRepository.remove(serviceOffering);
        return !!result;
    }
}