import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { BusinessProfileDto } from './dto/business-profile.dto';
import { BusinessService } from 'src/business/services/business.service';
import { ServiceOfferingService } from 'src/service-offering/service-offering.service';
import { CreateBusinessDto } from 'src/business/dto/create-business.dto';
import { CreateServiceOfferingDto } from 'src/service-offering/dto/create-service-offering.dto';
import { Business } from 'src/business/entities/business.entity';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import {
  UpdateBusinessServicesDto,
  UpdateServiceOfferingDto,
} from './dto/business-offerings-update.dto';
import { UpdateBusinessDetailsDto } from './dto/business-details-update.dto';
import { BusinessOpeningHoursService } from 'src/business/services/business-opening-hours.service';
import { BusinessOpeningHours } from 'src/business/entities/business-opening-hours.entity';
import { BusinessMapper } from './business.mapper';
import { FullServiceOfferingDto } from 'src/service-offering/dto/full-service-offering.dto';
import { GooglePlacesService } from '../google-places/service/google-places.service';

@Injectable()
export class BusinessManagementService {
  private readonly logger = new Logger(BusinessManagementService.name);

  constructor(
    private readonly businessService: BusinessService,
    private readonly serviceOfferingService: ServiceOfferingService,
    private readonly openingHoursService: BusinessOpeningHoursService,
    private readonly googlePlacesService: GooglePlacesService,
  ) {}

  /**
   * Get a business profile by ID
   *
   * @param businessId The ID of the business
   * @returns The business profile including services
   * @throws NotFoundException if business doesn't exist
   */
  async getBusinessProfile(
    businessId: string,
    userId: number,
  ): Promise<BusinessProfileDto> {
    return await this.businessService.getBusinessProfile(businessId, userId);
  }

  /**
   * Get a business details
   *
   * @param businessId The ID of the business
   * @returns The business profile including services
   * @throws NotFoundException if business doesn't exist
   */
  async getBusinessDetails(businessId: string): Promise<BusinessProfileDto> {
    try {
      this.logger.log(
        `Attempting to fetch Business with ID ${businessId} from database.`,
      );
      return await this.businessService.getBusinessDetails(businessId);
    } catch (error) {
      if (error.name === 'NotFoundException') {
        this.logger.log(
          `Business with ID ${businessId} not found in the database. Attempting to fetch from Google Places...`,
        );
        return this.googlePlacesService.getGooglePlaceDetails(businessId);
      } else {
        throw new NotFoundException(
          `Business with ID ${businessId} not found. ${error.name}`,
        );
      }
    }
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
  ): Promise<BusinessProfileDto> {
    const { openingHours, ...businessData } = createBusinessDto;
    const savedBusiness = await this.businessService.createBusiness(
      userId,
      createBusinessDto,
    );
    if (openingHours && openingHours.length > 0) {
      savedBusiness.openingHours =
        await this.openingHoursService.createForBusiness(
          savedBusiness.id,
          openingHours,
        );
      console.log('Saved opening hours', savedBusiness.openingHours);
    }

    return BusinessMapper.toBusinessProfileDto(savedBusiness);
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
    businessId: string,
    createServiceOfferingDto: CreateServiceOfferingDto[],
  ): Promise<FullServiceOfferingDto[]> {
    try {
      await this.businessService.isOwnedByUser(userId, businessId);

      const serviceOfferings = await this.serviceOfferingService.createMultiple(
        businessId,
        createServiceOfferingDto,
      );
      return serviceOfferings.map(BusinessMapper.toFullServiceOfferingDto);
    } catch (error) {
      throw new ForbiddenException(
        `You are not allowed to modify this business. ${error.message}`,
      );
    }
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
    businessId: string,
    updateBusinessDetailsDto: UpdateBusinessDetailsDto,
  ): Promise<BusinessProfileDto> {
    try {
      await this.businessService.isOwnedByUser(userId, businessId);
      const { openingHours, ...businessData } = updateBusinessDetailsDto;

      const updatedBusiness = await this.businessService.updateBusiness(
        businessId,
        businessData,
      );

      if (openingHours && openingHours.length > 0) {
        updatedBusiness.openingHours =
          await this.openingHoursService.updateForBusiness(
            businessId,
            openingHours,
          );
      }

      return BusinessMapper.toBusinessProfileDto(updatedBusiness);
    } catch (error) {
      throw new ForbiddenException(
        `You are not allowed to modify this business. ${error.message}`,
      );
    }
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
    businessId: string,
    updateBusinessServicesDto: UpdateBusinessServicesDto,
  ): Promise<FullServiceOfferingDto[]> {
    try {
      await this.businessService.isOwnedByUser(userId, businessId);
      const updatedServices = await Promise.all(
        updateBusinessServicesDto.services.map(
          (serviceDto: UpdateServiceOfferingDto) =>
            this.serviceOfferingService.update(serviceDto.id, serviceDto),
        ),
      );
      return updatedServices.map(BusinessMapper.toFullServiceOfferingDto);
    } catch (error) {
      throw new ForbiddenException(
        `You are not allowed to modify this business. ${error.message}`,
      );
    }
  }

  /**
   * Update opening hours for a business
   *
   * @param userId The ID of the user updating the hours
   * @param businessId The ID of the business
   * @param openingHours The new opening hours data
   * @returns The updated opening hours
   * @throws NotFoundException if business doesn't exist
   * @throws ForbiddenException if user is not the owner
   */
  async updateBusinessOpeningHours(
    userId: number,
    businessId: string,
    openingHours: Array<{
      dayOfWeek: number;
      opensAt: string;
      closesAt: string;
    }>,
  ): Promise<BusinessOpeningHours[]> {
    try {
      await this.businessService.isOwnedByUser(userId, businessId);
      return await this.openingHoursService.updateForBusiness(
        businessId,
        openingHours,
      );
    } catch (error) {
      throw new ForbiddenException(
        `You are not allowed to modify this business. ${error.message}`,
      );
    }
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
    businessId: string,
    serviceOfferingId: number,
  ): Promise<boolean> {
    try {
      await this.businessService.isOwnedByUser(userId, businessId);
      return await this.serviceOfferingService.deleteServiceOfferingByIdAndBusinessId(
        serviceOfferingId,
        businessId,
      );
    } catch (error) {
      throw new ForbiddenException(
        `You are not allowed to modify this business. ${error.message}`,
      );
    }
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
  async deleteBusinessAndServices(
    businessId: string,
    userId: number,
  ): Promise<boolean> {
    return await this.businessService.deleteBusinessByIdAndUserId(
      businessId,
      userId,
    );
  }
}
