import { ForbiddenException, Logger, NotFoundException } from "@nestjs/common";
import { CreateBusinessDto, UpdateBusinessDto } from "../dto/business.dto";
import { DeleteResult, UpdateResult } from "typeorm";
import { Business, BusinessCategory } from "../entities/business.entity";
import { BusinessService } from "./business.service";
import { Test, TestingModule } from "@nestjs/testing";
import { BusinessRepository } from "../repositories/business.repository";
import { BusinessProfileDto } from "src/business-management/dto/business-profile.dto";
import { User } from "src/users/entities/user.entity";
import { BusinessMapper } from "src/business-management/mapper/business.mapper";

describe('BusinessService', () => {
  let service: BusinessService;
  let businessRepository: jest.Mocked<BusinessRepository>;
  let logger: jest.Mocked<Logger>;

  const mockBusiness: Business = {
    id: 'business-123',
    name: 'Test Business',
    description: 'Test Description',
    categories: [BusinessCategory.CarDealer],
    specializations: ['Italian'],
    email: 'test@business.com',
    website: 'https://test.com',
    phone: '+1234567890',
    address: '123 Test St',
    city: 'Test City',
    latitude: 40.7128,
    longitude: -74.0060,
    facebook: 'facebook.com/test',
    instagram: 'instagram.com/test',
    youtube: 'youtube.com/test',
    linkedin: 'linkedin.com/test',
    tiktok: 'tiktok.com/test',
    isVerified: false,
    isSponsored: false,
    acceptBookings: false,
    ownerId: 1,
    logoUrl: undefined,
    logoMapUrl: undefined,
    photoUrl: undefined,
    additionalPhotos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: {} as User,
    openingHours: [],
    serviceOfferings: [],
    slots: [],
    reviews: [],
  };

  const businessProfileDto: BusinessProfileDto = BusinessMapper.toBusinessProfileDto(mockBusiness);

  beforeEach(async () => {
    const mockBusinessRepository = {
      findBusinessWithOpeningHoursAndServiceOfferingsById: jest.fn(),
      createBusiness: jest.fn(),
      updateBusiness: jest.fn(),
      deleteBusiness: jest.fn(),
      findBusinessById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        {
          provide: BusinessRepository,
          useValue: mockBusinessRepository,
        },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
    businessRepository = module.get(BusinessRepository);
    
    // Mock the logger
    logger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;
    
    // Replace the private logger with our mock
    (service as any).logger = logger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBusinessDetails', () => {
    it('should return business profile when business exists', async () => {
      // Arrange
      const businessId = 'business-123';
      businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById.mockResolvedValue(mockBusiness);

      // Act
      const result = await service.getBusinessDetails(businessId);
        console.log(`Result: ${JSON.stringify(result)}`); // Debugging line
      // Assert
      expect(logger.log).toHaveBeenCalledWith(`Attempting to fetch Business with ID ${businessId} from database.`);
      expect(businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById).toHaveBeenCalledWith(businessId);
      expect(result).toEqual(businessProfileDto);
    });

    it('should throw NotFoundException when business does not exist', async () => {
      // Arrange
      const businessId = 'non-existent';
      businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getBusinessDetails(businessId)).rejects.toThrow(
        new NotFoundException(`Business with ID ${businessId} not found.`)
      );
      expect(businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById).toHaveBeenCalledWith(businessId);
    });
  });

  describe('createBusiness', () => {
    const createBusinessDto: CreateBusinessDto = {
      name: 'New Business',
      description: 'New Description',
      categories: [BusinessCategory.CarDealer],
      specializations: ['Italian'],
      email: 'new@business.com',
      website: 'https://new.com',
      phone: '+1234567890',
      address: '456 New St',
      city: 'New City',
      latitude: 40.7589,
      longitude: -73.9851,
      facebook: 'facebook.com/new',
      instagram: 'instagram.com/new',
      youtube: 'youtube.com/new',
      linkedin: 'linkedin.com/new',
      tiktok: 'tiktok.com/new',
    };

    it('should create business without searchEngineId', async () => {
      // Arrange
      const ownerId = 1;
      const expectedBusinessData = {
        name: createBusinessDto.name,
        description: createBusinessDto.description,
        categories: createBusinessDto.categories,
        specializations: createBusinessDto.specializations,
        email: createBusinessDto.email,
        website: createBusinessDto.website,
        phone: createBusinessDto.phone,
        address: createBusinessDto.address,
        city: createBusinessDto.city,
        latitude: createBusinessDto.latitude,
        longitude: createBusinessDto.longitude,
        facebook: createBusinessDto.facebook,
        instagram: createBusinessDto.instagram,
        youtube: createBusinessDto.youtube,
        linkedin: createBusinessDto.linkedin,
        tiktok: createBusinessDto.tiktok,
        isVerified: false,
        isSponsored: false,
        acceptBookings: false,
        ownerId,
      };
      businessRepository.createBusiness.mockResolvedValue(mockBusiness);

      // Act
      const result = await service.createBusiness(ownerId, createBusinessDto);

      // Assert
      expect(logger.log).toHaveBeenCalledWith(`Creating business for user ID: ${ownerId}`);
      expect(businessRepository.createBusiness).toHaveBeenCalledWith(expectedBusinessData);
      expect(result).toBe(mockBusiness);
    });

    it('should create business with searchEngineId when provided', async () => {
      // Arrange
      const ownerId = 1;
      const searchEngineId = 'search-engine-123';
      const dtoWithSearchEngineId = { ...createBusinessDto, searchEngineId };
      const expectedBusinessData = {
        id: searchEngineId,
        name: createBusinessDto.name,
        description: createBusinessDto.description,
        categories: createBusinessDto.categories,
        specializations: createBusinessDto.specializations,
        email: createBusinessDto.email,
        website: createBusinessDto.website,
        phone: createBusinessDto.phone,
        address: createBusinessDto.address,
        city: createBusinessDto.city,
        latitude: createBusinessDto.latitude,
        longitude: createBusinessDto.longitude,
        facebook: createBusinessDto.facebook,
        instagram: createBusinessDto.instagram,
        youtube: createBusinessDto.youtube,
        linkedin: createBusinessDto.linkedin,
        tiktok: createBusinessDto.tiktok,
        isVerified: false,
        isSponsored: false,
        acceptBookings: false,
        ownerId,
      };
      businessRepository.createBusiness.mockResolvedValue(mockBusiness);

      // Act
      const result = await service.createBusiness(ownerId, dtoWithSearchEngineId);

      // Assert
      expect(businessRepository.createBusiness).toHaveBeenCalledWith(expectedBusinessData);
      expect(result).toBe(mockBusiness);
    });
  });

  describe('updateBusiness', () => {
    const updateBusinessDto: UpdateBusinessDto = {
      name: 'Updated Business',
      description: 'Updated Description',
      photos: {
        logoUrl: 'https://new-logo.com',
        logoMapUrl: 'https://new-logo-map.com',
      },
      flags: {
        acceptBookings: true,
        isVerified: true,
      },
    };

    it('should update business successfully', async () => {
      // Arrange
      const businessId = 'business-123';
      const updateResult: UpdateResult = { affected: 1, generatedMaps: [], raw: {} };
      businessRepository.updateBusiness.mockResolvedValue(updateResult);
      businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById.mockResolvedValue(mockBusiness);

      // Act
      const result = await service.updateBusiness(businessId, updateBusinessDto);

      // Assert
      expect(logger.log).toHaveBeenCalledWith(`Updating business with ID: ${businessId}`);
      expect(businessRepository.updateBusiness).toHaveBeenCalledWith(businessId, {
        name: 'Updated Business',
        description: 'Updated Description',
        logoUrl: 'https://new-logo.com',
        logoMapUrl: 'https://new-logo-map.com',
        acceptBookings: true,
        isVerified: true,
      });
      expect(businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById).toHaveBeenCalledWith(businessId);
      expect(result).toBe(mockBusiness);
    });

    it('should throw NotFoundException when update affects no rows', async () => {
      // Arrange
      const businessId = 'business-123';
      const updateResult: UpdateResult = { affected: 0, generatedMaps: [], raw: {} };
      businessRepository.updateBusiness.mockResolvedValue(updateResult);

      // Act & Assert
      await expect(service.updateBusiness(businessId, updateBusinessDto)).rejects.toThrow(
        new NotFoundException(`Business with ID ${businessId} not found`)
      );
    });

    it('should warn when no valid fields to update', async () => {
      // Arrange
      const businessId = 'business-123';
      const emptyUpdateDto: UpdateBusinessDto = {};
      businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById.mockResolvedValue(mockBusiness);

      // Act
      const result = await service.updateBusiness(businessId, emptyUpdateDto);

      // Assert
      expect(logger.warn).toHaveBeenCalledWith(`No valid fields to update for business ID ${businessId}`);
      expect(businessRepository.updateBusiness).not.toHaveBeenCalled();
      expect(result).toBe(mockBusiness);
    });

    it('should throw NotFoundException when business not found after update', async () => {
      // Arrange
      const businessId = 'business-123';
      const updateResult: UpdateResult = { affected: 1, generatedMaps: [], raw: {} };
      businessRepository.updateBusiness.mockResolvedValue(updateResult);
      businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateBusiness(businessId, updateBusinessDto)).rejects.toThrow(
        new NotFoundException(`Business with ID ${businessId} not found after update.`)
      );
    });
  });

  describe('deleteBusinessById', () => {
    it('should delete business successfully', async () => {
      // Arrange
      const businessId = 'business-123';
      const deleteResult: DeleteResult = { affected: 1, raw: {} };
      businessRepository.deleteBusiness.mockResolvedValue(deleteResult);

      // Act
      const result = await service.deleteBusinessById(businessId);

      // Assert
      expect(logger.log).toHaveBeenCalledWith(`Deleting business with ID: ${businessId}`);
      expect(businessRepository.deleteBusiness).toHaveBeenCalledWith(businessId);
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when delete affects no rows', async () => {
      // Arrange
      const businessId = 'business-123';
      const deleteResult: DeleteResult = { affected: 0, raw: {} };
      businessRepository.deleteBusiness.mockResolvedValue(deleteResult);

      // Act & Assert
      await expect(service.deleteBusinessById(businessId)).rejects.toThrow(
        new NotFoundException(`Business with ID ${businessId} not found`)
      );
    });
  });

  describe('findBusinessAndValidateOwnership', () => {
    it('should return business when user is owner', async () => {
      // Arrange
      const businessId = 'business-123';
      const userId = 1;
      const business = { ...mockBusiness, ownerId: userId };
      businessRepository.findBusinessById.mockResolvedValue(business);

      // Act
      const result = await service.findBusinessAndValidateOwnership(businessId, userId);

      // Assert
      expect(businessRepository.findBusinessById).toHaveBeenCalledWith(businessId);
      expect(result).toBe(business);
    });

    it('should throw NotFoundException when business does not exist', async () => {
      // Arrange
      const businessId = 'non-existent';
      const userId = 1;
      businessRepository.findBusinessById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findBusinessAndValidateOwnership(businessId, userId)).rejects.toThrow(
        new NotFoundException(`Business with ID ${businessId} not found for user ${userId}`)
      );
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      // Arrange
      const businessId = 'business-123';
      const userId = 2;
      const business = { ...mockBusiness, ownerId: 1 };
      businessRepository.findBusinessById.mockResolvedValue(business);

      // Act & Assert
      await expect(service.findBusinessAndValidateOwnership(businessId, userId)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('prepareUpdateData', () => {
    it('should prepare update data with all fields', async () => {
      // Arrange
      const updateDto: UpdateBusinessDto = {
        name: 'Updated Name',
        description: 'Updated Description',
        photos: {
          logoUrl: 'https://logo.com',
          logoMapUrl: 'https://logo-map.com',
          photoUrl: 'https://photo.com',
          additionalPhotos: ['https://photo1.com', 'https://photo2.com'],
        },
        flags: {
          acceptBookings: true,
          isVerified: true,
          isSponsored: false,
        },
      };

      // Act
      const result = await (service as any).prepareUpdateData(updateDto);

      // Assert
      expect(result.businessData).toEqual({
        name: 'Updated Name',
        description: 'Updated Description',
        logoUrl: 'https://logo.com',
        logoMapUrl: 'https://logo-map.com',
        photoUrl: 'https://photo.com',
        additionalPhotos: ['https://photo1.com', 'https://photo2.com'],
        acceptBookings: true,
        isVerified: true,
        isSponsored: false,
      });
    });

    it('should prepare update data with partial fields', async () => {
      // Arrange
      const updateDto: UpdateBusinessDto = {
        name: 'Updated Name',
        photos: {
          logoUrl: 'https://logo.com',
        },
      };

      // Act
      const result = await (service as any).prepareUpdateData(updateDto);

      // Assert
      expect(result.businessData).toEqual({
        name: 'Updated Name',
        logoUrl: 'https://logo.com',
      });
    });

    it('should prepare update data with undefined photo and flag values', async () => {
      // Arrange
      const updateDto: UpdateBusinessDto = {
        name: 'Updated Name',
        photos: {
          logoUrl: undefined,
          logoMapUrl: 'https://logo-map.com',
        },
        flags: {
          acceptBookings: undefined,
          isVerified: true,
        },
      };

      // Act
      const result = await (service as any).prepareUpdateData(updateDto);

      // Assert
      expect(result.businessData).toEqual({
        name: 'Updated Name',
        logoMapUrl: 'https://logo-map.com',
        isVerified: true,
      });
      expect(result.businessData.logoUrl).toBeUndefined();
      expect(result.businessData.acceptBookings).toBeUndefined();
    });
  });
});