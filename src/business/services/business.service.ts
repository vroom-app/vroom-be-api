import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateBusinessDto, UpdateBusinessDto, UpdateBusinessPhotosDto } from '../dto/business.dto';
import { Business, BusinessCategory } from '../entities/business.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessProfileDto } from 'src/business-management/dto/business-profile.dto';
import { BusinessMapper } from 'src/business-management/mapper/business.mapper';
import { BusinessOpeningHours } from '../entities/business-opening-hours.entity';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  /**
   * Get all businesses owned by a specific user
   * @param userId The ID of the user
   * @returns Array of businesses owned by the user
   */
  async getAllUserBusinesses(userId: number): Promise<Business[]> {
    return this.businessRepository.find({
      where: {
        ownerId: userId,
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['openingHours', 'specializations.specialization'],
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
    businessId: string,
    userId: number,
  ): Promise<BusinessProfileDto> {
    const business = await this.businessRepository.findOne({
      where: {
        id: businessId,
        ownerId: userId,
      },
      relations: {
        openingHours: true,
        serviceOfferings: true,
      },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    return BusinessMapper.toBusinessProfileDto(business);
  }

  /**
   * Get a business profile by ID
   *
   * @param businessId The ID of the business
   * @param userId The ID of the user requesting the profile
   * @returns The business profile including services, specializations, and opening hours
   * @throws NotFoundException if business doesn't exist
   */
  async getBusinessDetails(businessId: string): Promise<BusinessProfileDto> {
    const business = await this.businessRepository.findOne({
      where: {
        id: businessId,
      },
      relations: {
        openingHours: true,
      },
    });

    if (!business) {
      throw new NotFoundException(
        `Business with ID ${businessId} not found in the database.`,
      );
    }

    return BusinessMapper.toBusinessProfileDto(business);
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
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      select: ['id', 'ownerId'],
    });

    if (!business) {
      this.logger.warn(
        `Business with ID ${businessId} not found for user ${userId}`,
      );
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    if (business.ownerId !== userId) {
      this.logger.warn(
        `User with ID ${userId} attempted to access business ${businessId} they do not own.`,
      );
      throw new ForbiddenException('You are not the owner of this business');
    }

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
  async findBusinessAndValidateOwnership(businessId: string, userId: number): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      select: ['id', 'ownerId'],
    });

    if (!business) {
      this.logger.warn(
        `Business with ID ${businessId} not found for user ${userId}`,
      );
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    if (business.ownerId !== userId) {
      this.logger.warn(
        `User with ID ${userId} attempted to access business ${businessId} they do not own.`,
      );
      throw new ForbiddenException('You are not the owner of this business');
    }

    return business;
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

    const business = this.businessRepository.create(businessData);
    
    return this.businessRepository.save(business);
  }

  /**
   * Update a business with optimized database operations and proper validation
   * @param id The ID of the business to update
   * @param userId The ID of the current user
   * @param updateBusinessDto DTO containing updated business data
   * @param isAdmin Whether the current user is an admin
   * @returns The updated business
   * @throws NotFoundException if business doesn't exist
   * @throws ForbiddenException if user is not the owner (and not admin)
   */
  async updateBusiness(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
    isAdmin: boolean = false,
  ): Promise<Business> {
    // Start transaction for data consistency
    return await this.businessRepository.manager.transaction(async (transactionManager) => {
      const businessRepo = transactionManager.getRepository(Business);
      const openingHoursRepo = transactionManager.getRepository(BusinessOpeningHours);

      // Prepare update data
      const updateData = await this.prepareUpdateData(updateBusinessDto, isAdmin);

      // Update business data if there are fields to update
      if (Object.keys(updateData.businessData).length > 0) {
        await businessRepo.update(id, updateData.businessData);
      }

      // Handle opening hours update
      if (updateBusinessDto.openingHours !== undefined) {
        await this.updateOpeningHours(openingHoursRepo, id, updateBusinessDto.openingHours);
      }

      // Return updated business with all relations
      const updatedBusiness = await businessRepo.findOne({
        where: { id },
        relations: ['openingHours', 'owner'],
      });

      return updatedBusiness!;
    });
  }

  /**
   * Update only photo URLs for a business
   * Useful for separate photo upload services
   */
  async updateBusinessPhotos(
    id: string,
    userId: number,
    photosDto: UpdateBusinessPhotosDto,
    isAdmin: boolean = false,
  ): Promise<Business> {
    // Verify ownership first
    const business = await this.businessRepository.findOne({
      where: { id },
      select: ['id', 'ownerId'],
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    if (!isAdmin && business.ownerId !== userId) {
      throw new ForbiddenException('You are not authorized to update this business');
    }

    // Update only photo fields
    const updateData: Partial<Business> = {};
    if (photosDto.logoUrl !== undefined) updateData.logoUrl = photosDto.logoUrl;
    if (photosDto.logoMapUrl !== undefined) updateData.logoMapUrl = photosDto.logoMapUrl;
    if (photosDto.photoUrl !== undefined) updateData.photoUrl = photosDto.photoUrl;
    if (photosDto.additionalPhotos !== undefined) updateData.additionalPhotos = photosDto.additionalPhotos;

    if (Object.keys(updateData).length > 0) {
      await this.businessRepository.update(id, updateData);
    }

    return await this.businessRepository.findOne({
      where: { id },
      relations: ['openingHours', 'owner'],
    })!;
  }

  /**
   * Update business flags (admin/owner only operations)
   */
  async updateBusinessFlags(
    id: string,
    userId: number,
    flagsDto: UpdateBusinessFlagsDto,
    isAdmin: boolean = false,
  ): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      select: ['id', 'ownerId'],
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    if (!isAdmin && business.ownerId !== userId) {
      throw new ForbiddenException('You are not authorized to update this business');
    }

    // Some flags might be admin-only
    const updateData: Partial<Business> = {};
    if (flagsDto.acceptBookings !== undefined) updateData.acceptBookings = flagsDto.acceptBookings;
    
    // Admin-only flags
    if (isAdmin) {
      if (flagsDto.isVerified !== undefined) updateData.isVerified = flagsDto.isVerified;
      if (flagsDto.isSponsored !== undefined) updateData.isSponsored = flagsDto.isSponsored;
    }

    if (Object.keys(updateData).length > 0) {
      await this.businessRepository.update(id, updateData);
    }

    return await this.businessRepository.findOne({
      where: { id },
      relations: ['openingHours', 'owner'],
    })!;
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
  async deleteBusinessByIdAndUserId(
    id: string,
    userId: number,
  ): Promise<boolean> {
    const business = await this.findById(id);

    if (business.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this business',
      );
    }

    const result = await this.businessRepository.remove(business);
    return !!result;
  }

  /**
   * Find a business by ID
   * @param id The ID of the business
   * @returns The found business
   * @throws NotFoundException if business doesn't exist
   */
  async findById(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return business;
  }

  // ── PRIVATE HELPER METHODS ──────────────────────────────────────────

  private async prepareUpdateData(
    updateDto: UpdateBusinessDto,
    isAdmin: boolean,
  ): Promise<{ businessData: Partial<Business> }> {
    const { openingHours, photos, flags, ...businessFields } = updateDto;
    
    const businessData: Partial<Business> = { ...businessFields };

    // Handle photo updates
    if (photos) {
      if (photos.logoUrl !== undefined) businessData.logoUrl = photos.logoUrl;
      if (photos.logoMapUrl !== undefined) businessData.logoMapUrl = photos.logoMapUrl;
      if (photos.photoUrl !== undefined) businessData.photoUrl = photos.photoUrl;
      if (photos.additionalPhotos !== undefined) businessData.additionalPhotos = photos.additionalPhotos;
    }

    // Handle flag updates
    if (flags) {
      if (flags.acceptBookings !== undefined) businessData.acceptBookings = flags.acceptBookings;
      if (flags.isVerified !== undefined) businessData.isVerified = flags.isVerified;
      if (flags.isSponsored !== undefined) businessData.isSponsored = flags.isSponsored;
    }

    return { businessData };
  }

  private async updateOpeningHours(
    openingHoursRepo: Repository<BusinessOpeningHours>,
    businessId: string,
    openingHours: OpeningHoursDto[],
  ): Promise<void> {
    // Delete existing opening hours
    await openingHoursRepo.delete({ businessId });

    // Insert new opening hours if provided
    if (openingHours.length > 0) {
      const newOpeningHours = openingHours.map((hours) => ({
        businessId,
        dayOfWeek: hours.dayOfWeek,
        opensAt: hours.opensAt,
        closesAt: hours.closesAt,
      }));

      await openingHoursRepo.save(newOpeningHours);
    }
  }

  /**
   * Bulk update business photos (useful for batch processing)
   */
  async bulkUpdateBusinessPhotos(
    updates: Array<{ businessId: string; photos: UpdateBusinessPhotosDto }>,
  ): Promise<void> {
    await this.businessRepository.manager.transaction(async (transactionManager) => {
      const businessRepo = transactionManager.getRepository(Business);

      for (const update of updates) {
        const updateData: Partial<Business> = {};
        
        if (update.photos.logoUrl !== undefined) updateData.logoUrl = update.photos.logoUrl;
        if (update.photos.logoMapUrl !== undefined) updateData.logoMapUrl = update.photos.logoMapUrl;
        if (update.photos.photoUrl !== undefined) updateData.photoUrl = update.photos.photoUrl;
        if (update.photos.additionalPhotos !== undefined) {
          updateData.additionalPhotos = update.photos.additionalPhotos;
        }

        if (Object.keys(updateData).length > 0) {
          await businessRepo.update(update.businessId, updateData);
        }
      }
    });
  }
}
