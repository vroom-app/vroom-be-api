import { Injectable, Logger } from '@nestjs/common';
import { BusinessService } from 'src/business/services/business.service';
import { CreateServiceOfferingDto } from 'src/service-offering/dto/create-service-offering.dto';
import { ServiceOfferingDto } from 'src/service-offering/dto/service-offering.dto';
import { ServiceOfferingService } from 'src/service-offering/services/service-offering.service';
import { BusinessMapper } from '../mapper/business.mapper';

@Injectable()
export class ServiceOfferingManagementService {
  private readonly logger = new Logger(ServiceOfferingManagementService.name);

  constructor(
    private readonly businessService: BusinessService,
    private readonly serviceOfferingService: ServiceOfferingService,
  ) {}

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
  async createServiceOfferingsForBusiness(
    userId: number,
    businessId: string,
    createServiceOfferingDto: CreateServiceOfferingDto[],
  ): Promise<ServiceOfferingDto[]> {
    await this.businessService.findBusinessAndValidateOwnership(
      businessId,
      userId,
    );

    const serviceOfferings =
      await this.serviceOfferingService.createMultipleServices(
        businessId,
        createServiceOfferingDto,
      );
    return serviceOfferings.map(BusinessMapper.toServiceOfferingDto);
  }

  /**
   * Update multiple service offerings for a business
   *
   * @param userId The ID of the user updating the services
   * @param businessId The ID of the business
   * @param serviceId The ID of the service
   * @param updateBusinessServicesDto The DTO containing service update data
   * @returns The updated service offerings
   * @throws NotFoundException if business/service doesn't exist
   * @throws ForbiddenException if user is not the owner
   */
  async updateBusinessService(
    userId: number,
    businessId: string,
    serviceId: number,
    updateData: Partial<CreateServiceOfferingDto>,
  ): Promise<ServiceOfferingDto> {
    this.logger.debug(
      `Update service offering ${serviceId} for business ${businessId}`,
    );
    await this.businessService.findBusinessServiceAndValidateOwnership(
      businessId,
      serviceId,
      userId,
    );
    return BusinessMapper.toServiceOfferingDto(
      await this.serviceOfferingService.update(serviceId, updateData),
    );
  }

  /**
   * Delete a {@link ServiceOffering}
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
    businessId: string,
    serviceId: number,
  ): Promise<boolean> {
    await this.businessService.findBusinessServiceAndValidateOwnership(
      businessId,
      serviceId,
      userId,
    );

    return await this.serviceOfferingService.deleteServiceById(serviceId);
  }
}
