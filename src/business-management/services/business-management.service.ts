import { Injectable, Logger } from '@nestjs/common';
import { BusinessService } from 'src/business/services/business.service';
import {
  CreateBusinessDto,
  UpdateBusinessDto,
} from 'src/business/dto/business.dto';
import { Business } from 'src/business/entities/business.entity';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { BusinessOpeningHoursService } from 'src/business/services/business-opening-hours.service';
import { BusinessOpeningHours } from 'src/business/entities/business-opening-hours.entity';
import { SearchClientService } from 'src/search-client/search-client.service';
import { BusinessProfileDto } from '../dto/business-profile.dto';
import { SearchBusinessPayload } from 'src/search-client/search-client.interface';
import { BusinessMapper } from 'src/common/utils/business-mapper.util';

@Injectable()
export class BusinessManagementService {
  private readonly logger = new Logger(BusinessManagementService.name);

  constructor(
    private readonly businessService: BusinessService,
    private readonly openingHoursService: BusinessOpeningHoursService,
    private readonly searchClient: SearchClientService,
  ) {}

  /**
   * Get a business details {@link BusinessProfileDto} by its ID.
   *
   * @param businessId The ID of the business
   * @returns The business profile including services
   * @throws NotFoundException if business doesn't exist
   */
  async getBusinessProfile(businessId: string): Promise<BusinessProfileDto> {
    return await this.businessService.getBusinessDetails(businessId);
  }

  /**
   * Get a business details {@link BusinessProfileDto} by its slug.
   *
   * @param slug The slug of the business
   * @returns The business profile including services
   * @throws NotFoundException if business doesn't exist
   */
  async getBusinessProfileBySlug(slug: string): Promise<BusinessProfileDto> {
    return await this.businessService.getBusinessDetailsBySlug(slug);
  }

  /**
   * Create a {@link Business} and its associated {@link BusinessServiceOffering} and {@link BusinessOpeningHours}.
   * TODO the function does not provide consistency between the business and the search engine.
   * - It should be refactored to ensure that if the business is created, it is also created in the search engine.
   * - This is a temporary solution to allow the business to be created in the search engine.
   *
   * @param userId The ID of the user creating the business
   * @param dto The DTO containing business
   * @returns The created business
   */
  async createBusiness(
    userId: number,
    dto: CreateBusinessDto,
  ): Promise<BusinessProfileDto> {
    const savedBusiness = await this.businessService.createBusiness(
      userId,
      dto,
    );

    const { openingHours } = dto;
    if (openingHours && openingHours.length > 0) {
      savedBusiness.openingHours =
        await this.openingHoursService.createForBusiness(
          savedBusiness.id,
          openingHours,
        );
    }

    await this.syncBusinessWithSearchEngine(savedBusiness);

    return BusinessMapper.toBusinessProfileDto(savedBusiness);
  }

  /**
   * Update business details including basic info and {@link BusinessOpeningHours}
   *
   * @param userId The ID of the user updating the business
   * @param businessId The ID of the business to update
   * @param updateBusinessDto The DTO containing business update data
   * @returns The updated business
   * @throws NotFoundException if business doesn't exist
   * @throws ForbiddenException if user is not the owner
   */
  async updateBusinessDetails(
    userId: number,
    businessId: string,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<BusinessProfileDto> {
    await this.businessService.findBusinessAndValidateOwnership(
      businessId,
      userId,
    );

    const { openingHours, ...businessData } = updateBusinessDto;

    const updatedBusiness = await this.businessService.updateBusiness(
      businessId,
      businessData,
    );
    await this.syncBusinessWithSearchEngine(updatedBusiness);

    if (openingHours && openingHours.length > 0) {
      updatedBusiness.openingHours =
        await this.openingHoursService.updateForBusiness(
          businessId,
          openingHours,
        );
    }

    return BusinessMapper.toBusinessProfileDto(updatedBusiness);
  }

  /**
   * Update {@link BusinessOpeningHours} for a business
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
    await this.businessService.findBusinessAndValidateOwnership(
      businessId,
      userId,
    );
    return await this.openingHoursService.updateForBusiness(
      businessId,
      openingHours,
    );
  }

  /**
   * Delete {@link Business} and its {@link ServiceOffering} and {@link BusinessOpeningHours}
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
    this.businessService.findBusinessAndValidateOwnership(businessId, userId);
    return await this.businessService.deleteBusinessById(businessId);
  }

  private async syncBusinessWithSearchEngine(savedBusiness: Business) {
    this.logger.log(`Syncing business with search engine ${savedBusiness}`);
    await this.searchClient.upsertBusiness(
      BusinessMapper.toSearchPayload(savedBusiness),
    );
  }
}
