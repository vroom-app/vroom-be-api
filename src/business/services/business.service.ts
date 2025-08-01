import { Injectable, Logger } from '@nestjs/common';
import {
  CreateBusinessDto,
  UpdateBusinessDto,
  UpdateBusinessPhotosDto,
} from '../dto/business.dto';
import { Business, BusinessCategory } from '../entities/business.entity';
import { BusinessProfileDto } from 'src/business-management/dto/business-profile.dto';
import { BusinessMapper } from 'src/business-management/mapper/business.mapper';
import { BusinessRepository } from '../repositories/business.repository';
import { assertEntityPresent } from 'src/common/utils/assertEntity';
import { assertOwnership } from 'src/common/utils/assertOwnership';
import { assertAffected } from 'src/common/utils/assertAffected';
import { assertServiceOwnership } from 'src/common/utils/assertServiceownership';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(private readonly businessRepository: BusinessRepository) {}

  /**
   * Get a business profile by ID
   *
   * @param businessId The ID of the business
   * @param userId The ID of the user requesting the profile
   * @returns The business profile including services, specializations, and opening hours
   * @throws NotFoundException if business doesn't exist
   */
  async getBusinessDetails(businessId: string): Promise<BusinessProfileDto> {
    this.logger.log(
      `Attempting to fetch Business with ID ${businessId} from database.`,
    );
    const business = assertEntityPresent(
      await this.businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById(
        businessId,
      ),
      `Business with ID ${businessId} not found.`,
    );

    return BusinessMapper.toBusinessProfileDto(business);
  }

  /**
   * Create a new business for a user
   * Only set the id if searchEngineId is provided, otherwise it should be automatically generated
   * @param userId The ID of the user creating the business
   * @param createBusinessDto DTO containing business data
   * @returns The created business
   */
  async createBusiness(
    ownerId: number,
    dto: CreateBusinessDto,
  ): Promise<Business> {
    this.logger.log(`Creating business for user ID: ${ownerId}`);
    const businessData: Partial<Business> = {
      // BASIC INFO
      name: dto.name,
      description: dto.description,
      // CATEGORIES & SPECIALISATIONS
      categories: dto.categories as BusinessCategory[],
      specializations: dto.specializations,
      // CONTACT & WEB
      email: dto.email,
      website: dto.website,
      phone: dto.phone,
      // LOCATION
      address: dto.address,
      city: dto.city,
      latitude: dto.latitude,
      longitude: dto.longitude,
      // SOCIAL LINKS
      facebook: dto.facebook,
      instagram: dto.instagram,
      youtube: dto.youtube,
      linkedin: dto.linkedin,
      tiktok: dto.tiktok,
      // FLAGS
      isVerified: false,
      isSponsored: false,
      acceptBookings: false,
      // RELATIONS
      ownerId,
    };

    // Only add the id if searchEngineId is provided
    if (dto.searchEngineId) {
      businessData.id = dto.searchEngineId;
    }
    return await this.businessRepository.createBusiness(businessData);
  }

  /**
   * Update a business with optimized database operations and proper validation
   * @param businessId The ID of the business to update
   * @param userId The ID of the current user
   * @param updateBusinessDto DTO containing updated business data
   * @returns The updated business
   * @throws NotFoundException if business doesn't exist
   * @throws ForbiddenException if user is not the owner (and not admin)
   */
  async updateBusiness(
    businessId: string,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    this.logger.log(`Updating business with ID: ${businessId}`);
    const updateData = await this.prepareUpdateData(updateBusinessDto);

    await this.updateIfNotEmpty(businessId, updateData.businessData);

    return assertEntityPresent(
      await this.businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById(
        businessId,
      ),
      `Business with ID ${businessId} not found after update.`,
    );
  }

  /**
   * Update business photos
   * @param businessId The ID of the business to update
   * @param photosDto DTO containing updated photo URLs
   * @returns The updated business profile
   */
  async updateBusinessPhotos(
    businessId: string,
    photosDto: UpdateBusinessPhotosDto,
  ): Promise<Business> {
    this.logger.log(`Updating photos for business ID: ${businessId}`);
    this.logger.debug(`Photos DTO: ${JSON.stringify(photosDto)}`);
    // Update only photo fields
    const updateData: Partial<Business> = {};
    if (photosDto.logoUrl !== undefined) updateData.logoUrl = photosDto.logoUrl;
    if (photosDto.logoMapUrl !== undefined)
      updateData.logoMapUrl = photosDto.logoMapUrl;
    if (photosDto.photoUrl !== undefined)
      updateData.photoUrl = photosDto.photoUrl;
    if (photosDto.additionalPhotos !== undefined)
      updateData.additionalPhotos = photosDto.additionalPhotos;

    await this.updateIfNotEmpty(businessId, updateData);

    return assertEntityPresent(
      await this.businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById(
        businessId,
      ),
      `Business with ID ${businessId} not found after update.`,
    );
  }

  /**
   * Delete a business if the user is the owner
   *
   * @param businessId The ID of the business to delete
   * @returns True if deletion was successful
   * @throws NotFoundException if business doesn't exist
   */
  async deleteBusinessById(businessId: string): Promise<boolean> {
    this.logger.log(`Deleting business with ID: ${businessId}`);
    const result = await this.businessRepository.deleteBusiness(businessId);
    assertAffected(result, `Business with ID ${businessId} not found`);
    return true;
  }

  /**
   * Validates if an user is the owner of a business
   * @todo This method should be replaced by `findBusinessAndValidateOwnership`
   * @param userId The ID of the user
   * @param businessId The ID of the business
   * @returns True is found and owned by the user
   * @throws NotFoundException if business doesn't exist
   * @throws ForbiddenException if user is not the owner
   * @deprecated Use `findBusinessAndValidateOwnership` instead
   */
  async isOwnedByUser(userId: number, businessId: string): Promise<boolean> {
    const business = assertEntityPresent(
      await this.businessRepository.findBusinessById(businessId),
      `Business with ID ${businessId} not found for user ${userId}`,
    );
    assertOwnership(
      business.ownerId,
      userId,
      'User with ID ${userId} is not the owner of business ${businessId}.',
    );

    return true;
  }

  /**
   * Find a business and validate ownership
   * @param businessId The ID of the business
   * @param userId The ID of the user
   * @returns The found business
   * @throws NotFoundException if business doesn't exist
   * @throws ForbiddenException if user is not the owner
   */
  async findBusinessAndValidateOwnership(
    businessId: string,
    userId: number,
  ): Promise<Business> {
    const business = assertEntityPresent(
      await this.businessRepository.findBusinessById(businessId),
      `Business with ID ${businessId} not found for user ${userId}`,
    );
    assertOwnership(
      business.ownerId,
      userId,
      `User with ID ${userId} is not the owner of business ${businessId}.`,
    );

    return business;
  }

  /**
   * Find a business service and validate ownership
   * @param businessId The ID of the business
   * @param serviceId The ID of the service
   * @param userId The ID of the user
   * @returns The found business with services and opening hours
   * @throws NotFoundException if business doesn't exist
   * @throws ForbiddenException if business is not the owner
   */
  async findBusinessServiceAndValidateOwnership(
    businessId: string,
    serviceId: number,
    userId: number,
  ): Promise<Business> {
    const business = assertEntityPresent(
      await this.businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById(
        businessId,
      ),
      `Business with ID ${businessId} not found for user ${userId}`,
    );
    assertServiceOwnership(
      business,
      serviceId,
      `User with ID ${userId} is not the owner of business ${businessId}.`,
    );

    return business;
  }

  // ── PRIVATE HELPER METHODS ──────────────────────────────────────────

  private async prepareUpdateData(
    updateDto: UpdateBusinessDto,
  ): Promise<{ businessData: Partial<Business> }> {
    const { openingHours, photos, flags, ...businessFields } = updateDto;

    const businessData: Partial<Business> = { ...businessFields };

    // Photo updates
    if (photos) {
      if (photos.logoUrl !== undefined) businessData.logoUrl = photos.logoUrl;
      if (photos.logoMapUrl !== undefined)
        businessData.logoMapUrl = photos.logoMapUrl;
      if (photos.photoUrl !== undefined)
        businessData.photoUrl = photos.photoUrl;
      if (photos.additionalPhotos !== undefined)
        businessData.additionalPhotos = photos.additionalPhotos;
    }

    // Flag updates
    if (flags) {
      if (flags.acceptBookings !== undefined)
        businessData.acceptBookings = flags.acceptBookings;
      if (flags.isVerified !== undefined)
        businessData.isVerified = flags.isVerified;
      if (flags.isSponsored !== undefined)
        businessData.isSponsored = flags.isSponsored;
    }

    return { businessData };
  }

  /**
   * Update a business if there are valid fields to update
   * @param businessId The ID of the business to update
   * @param updateData The data to update the business with
   * @throws NotFoundException if no business was not updated
   */
  private async updateIfNotEmpty(
    businessId: string,
    updateData: Partial<Business>,
  ) {
    if (Object.keys(updateData).length > 0) {
      const result = await this.businessRepository.updateBusiness(
        businessId,
        updateData,
      );
      assertAffected(result, `Business with ID ${businessId} not found`);
    } else {
      this.logger.warn(
        `No valid fields to update for business ID ${businessId}`,
      );
    }
  }
}
