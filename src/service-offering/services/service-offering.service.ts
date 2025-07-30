import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ACTION_TYPE, ServiceOffering } from '../entities/service-offering.entity';
import { CreateServiceOfferingDto } from '../dto/create-service-offering.dto';
import { ActionDetails, BookingSystemActionDetails, ContactFormActionDetails, CTAActionDetails, ECommerceActionDetails, EmbeddedActionDetails } from '../interfaces/action-details.interface';
import { ServiceOfferingRepository } from '../repositories/service-offering.repository';
import { assertEntityPresent } from 'src/common/utils/assertEntity';
import { assertAffected } from 'src/common/utils/assertAffected';

@Injectable()
export class ServiceOfferingService {
  private readonly logger = new Logger(ServiceOfferingService.name);

  constructor(private readonly serviceOfferingRepository: ServiceOfferingRepository) {}


  async createService(
    businessId: string, 
    createDto: CreateServiceOfferingDto
  ): Promise<ServiceOffering> {
    this.validateActionDetailsStructure(createDto.actionType, createDto.actionDetails);
    return this.serviceOfferingRepository.createService({
      businessId,
      ...createDto
    });
  }

  /**
   * Create multiple service offerings
   * @param businessId The ID of the business
   * @param createServiceOfferingDtos Array of DTOs containing service offering data
   * @returns Array of created service offerings
   */
  async createMultipleServices(
    businessId: string,
    createServiceOfferingDtos: CreateServiceOfferingDto[],
  ): Promise<ServiceOffering[]> {
    return Promise.all(createServiceOfferingDtos.map((dto) => this.createService(businessId, dto)));
  }

  /**
   * Update a service offering by ID
   * @param serviceId The ID of the service offering to update
   * @param updateServiceOfferingDto DTO containing updated service offering data
   * @returns The updated service offering
   * @throws NotFoundException if service offering doesn't exist
   */
  async update(serviceId: number, updateDto: Partial<CreateServiceOfferingDto>): Promise<ServiceOffering> {
    // If actionType is being changed, validate new actionDetails
    if (updateDto.actionType && updateDto.actionDetails) {
      this.validateActionDetailsStructure(updateDto.actionType, updateDto.actionDetails);
    } else if (updateDto.actionType && !updateDto.actionDetails) {
      throw new BadRequestException('actionDetails must be provided when changing actionType');
    }
    const result = await this.serviceOfferingRepository.updateSerivice(serviceId, updateDto)
    assertAffected(result, `Service with ID ${serviceId} not found`);
    
    return assertEntityPresent(
      await this.serviceOfferingRepository.findByServiceId(
        serviceId,
      ),
      `Service with ID ${serviceId} not found after update.`,
    );
  }

  /**
   * Delete a service offering by ID and business ID
   * @param serviceId The ID of the service offering to delete
   * @param businessId The ID of the business
   * @returns True if deletion was successful
   * @throws NotFoundException if service offering doesn't exist
   */
  async deleteServiceById(
    serviceId: number,
  ): Promise<boolean> {
    const result = await this.serviceOfferingRepository.deleteService(serviceId);
    assertAffected(result, `Service with ID ${serviceId} not found`);
    return true;
  }

  /**
   * Find a service offering by ID
   * @param serviceId The ID of the service offering to find
   * @returns The found service offering
   * @throws NotFoundException if service offering doesn't exist
   */
  async findById(serviceId: number): Promise<ServiceOffering> {
    return assertEntityPresent(
      await this.serviceOfferingRepository.findByServiceId(
        serviceId,
      ),
      `Service with ID ${serviceId} not found.`,
    );
  }

  private validateActionDetailsStructure(actionType: ACTION_TYPE, actionDetails: ActionDetails): void {
    if (actionDetails.type !== actionType) {
      throw new BadRequestException(`ActionDetails type must match actionType: expected ${actionType}, got ${actionDetails.type}`);
    }

    switch (actionType) {
      case ACTION_TYPE.BOOKING_SYSTEM:
        const bookingDetails = actionDetails as BookingSystemActionDetails;
        if (!bookingDetails.duration || !bookingDetails.price || !bookingDetails.currency) {
          throw new BadRequestException('BookingSystem actionDetails must include duration, price, and currency');
        }
        break;
      case ACTION_TYPE.E_COMMERCE:
        const ecommerceDetails = actionDetails as ECommerceActionDetails;
        if (!ecommerceDetails.productId || !ecommerceDetails.price || !ecommerceDetails.currency) {
          throw new BadRequestException('ECommerce actionDetails must include productId, price, and currency');
        }
        break;
      case ACTION_TYPE.CTA:
        const ctaDetails = actionDetails as CTAActionDetails;
        if (!ctaDetails.buttonText || !ctaDetails.redirectUrl) {
          throw new BadRequestException('CTA actionDetails must include buttonText and redirectUrl');
        }
        break;
      case ACTION_TYPE.EMBEDDED:
        const embeddedDetails = actionDetails as EmbeddedActionDetails;
        if (!embeddedDetails.embedUrl || !embeddedDetails.embedType) {
          throw new Error('Embedded actionDetails must include embedUrl and embedType');
        }
        break;
      case ACTION_TYPE.CONTACT_FORM:
        const contactDetails = actionDetails as ContactFormActionDetails;
        if (!contactDetails.fields || !Array.isArray(contactDetails.fields) || contactDetails.fields.length === 0) {
          throw new BadRequestException('ContactForm actionDetails must include at least one field');
        }
        break;
      case ACTION_TYPE.NONE:
        break;
    }
  }
}
