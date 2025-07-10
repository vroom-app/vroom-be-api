import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateBusinessDto } from '../dto/create-business.dto';
import { Business, BusinessCategory, BusinessSpecialization } from '../entities/business.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessProfileDto } from 'src/business-management/dto/business-profile.dto';
import { UpdateBusinessDetailsDto } from 'src/business-management/dto/business-details-update.dto';
import { BusinessMapper } from 'src/business-management/business.mapper';

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
   * @param userId The ID of the user
   * @param businessId The ID of the business
   * @returns True is found and owned by the user
   * @throws NotFoundException if business doesn't exist
   * @throws ForbiddenException if user is not the owner
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
   * Update a business if the user is the owner
   * @param id The ID of the business to update
   * @param updateBusinessDto DTO containing updated business data
   * @returns The updated business
   * @throws NotFoundException if business doesn't exist
   * @throws ForbiddenException if user is not the owner
   */
  async updateBusiness(
    id: string,
    updateBusinessDto: UpdateBusinessDetailsDto,
  ): Promise<Business> {
    const { openingHours, ...businessData } = updateBusinessDto;

    const result = await this.businessRepository.update(id, businessData);

    if (result.affected === 0) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    const updatedBusiness = await this.businessRepository.findOne({
      where: { id },
      relations: ['openingHours'],
    });

    if (!updatedBusiness) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return updatedBusiness;
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
   * Create a GeoJSON Point from latitude and longitude
   * @param latitude The latitude coordinate
   * @param longitude The longitude coordinate
   * @returns GeoJSON Point object uses [longitude, latitude] order
   */
  private createPointFromCoordinates(latitude: number, longitude: number) {
    return `(${longitude},${latitude})`;
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
}
