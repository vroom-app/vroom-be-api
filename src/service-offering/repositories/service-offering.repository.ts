import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceOffering } from '../entities/service-offering.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class ServiceOfferingRepository {
  constructor(
    @InjectRepository(ServiceOffering)
    private serviceOfferingRepository: Repository<ServiceOffering>,
  ) {}

  /**
   * Find a service by its ID.
   * @param seriviceId The ID of the service to find
   * @returns The service entity, or null if not found.
   */
  async findByServiceId(seriviceId: number): Promise<ServiceOffering | null> {
    return await this.serviceOfferingRepository.findOne({
      where: {
        id: seriviceId,
      },
    });
  }

  /**
   * Remove a service from the repository.
   * @param seriviceId The ID of the service to remove
   * @throws NotFoundException if the service does not exist.
   * @returns True if the service was successfully deleted, otherwise throws NotFoundException.
   */
  async deleteService(seriviceId: number): Promise<DeleteResult> {
    return await this.serviceOfferingRepository.delete({
      id: seriviceId,
    });
  }

  /**
   * Create a new service in the repository.
   * @param createData The data for the new service
   * @returns The created service entity.
   */
  async createService(
    createData: Partial<ServiceOffering>,
  ): Promise<ServiceOffering> {
    const service = this.serviceOfferingRepository.create(createData);
    return this.serviceOfferingRepository.save(service);
  }

  /**
   * Update a serivice in the repository.
   * @param seriviceId The ID of the serivice to update
   * @param updateData The data to update the serivice with
   */
  async updateSerivice(
    seriviceId: number,
    updateData: Partial<ServiceOffering>,
  ): Promise<UpdateResult> {
    return await this.serviceOfferingRepository.update(seriviceId, updateData);
  }
}
