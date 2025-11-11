import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { BusinessReviewService } from './business-review.service';
import { BusinessRepository } from '../repositories/business.repository';
import { SearchClientService } from 'src/search-client/search-client.service';
import { BusinessMapper } from 'src/common/utils/business-mapper.util';
import { Business } from '../entities/business.entity';

describe('BusinessReviewService', () => {
  let service: BusinessReviewService;
  let businessRepository: jest.Mocked<BusinessRepository>;
  let searchClient: jest.Mocked<SearchClientService>;

  const mockBusiness: Business = {
    id: 'business-123',
    name: 'Test Business',
    averageRating: 4.5,
    reviewCount: 10,
  } as Business;

  const mockSearchPayload = {
    id: 'business-123',
    name: 'Test Business',
    averageRating: 4.5,
    reviewCount: 10,
  };

  beforeEach(async () => {
    const mockBusinessRepository = {
      updateBusinessRating: jest.fn(),
      findBusinessWithOpeningHoursAndServiceOfferingsById: jest.fn(),
    };

    const mockSearchClientService = {
      upsertBusiness: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessReviewService,
        {
          provide: BusinessRepository,
          useValue: mockBusinessRepository,
        },
        {
          provide: SearchClientService,
          useValue: mockSearchClientService,
        },
      ],
    }).compile();

    service = module.get<BusinessReviewService>(BusinessReviewService);
    businessRepository = module.get(BusinessRepository);
    searchClient = module.get(SearchClientService);

    // Mock logger
    (service as any).logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    // Mock BusinessMapper
    jest
      .spyOn(BusinessMapper, 'toSearchPayload')
      .mockReturnValue(mockSearchPayload);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateBusinessRating', () => {
    it('should successfully update business rating and sync with search engine', async () => {
      // Arrange
      const businessId = 'business-123';
      businessRepository.updateBusinessRating.mockResolvedValue(undefined);
      businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById.mockResolvedValue(
        mockBusiness,
      );
      searchClient.upsertBusiness.mockResolvedValue(undefined);

      // Act
      await service.updateBusinessRating(businessId);

      // Assert
      expect(businessRepository.updateBusinessRating).toHaveBeenCalledWith(
        businessId,
      );
      expect(
        businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById,
      ).toHaveBeenCalledWith(businessId);
      expect(BusinessMapper.toSearchPayload).toHaveBeenCalledWith(mockBusiness);
      expect(searchClient.upsertBusiness).toHaveBeenCalledWith(
        mockSearchPayload,
      );
      expect((service as any).logger.log).toHaveBeenCalledWith(
        `Business rating updated for business ID: ${businessId}, new average rating: ${mockBusiness.averageRating}, review count: ${mockBusiness.reviewCount}`,
      );
    });

    it('should throw error when business not found after rating update', async () => {
      // Arrange
      const businessId = 'non-existent-business';
      businessRepository.updateBusinessRating.mockResolvedValue(undefined);
      businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById.mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(service.updateBusinessRating(businessId)).rejects.toThrow(
        `Business with ID ${businessId} not found after rating update`,
      );
      expect(businessRepository.updateBusinessRating).toHaveBeenCalledWith(
        businessId,
      );
      expect(searchClient.upsertBusiness).not.toHaveBeenCalled();
    });

    it('should log appropriate messages during the process', async () => {
      // Arrange
      const businessId = 'business-123';
      businessRepository.updateBusinessRating.mockResolvedValue(undefined);
      businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById.mockResolvedValue(
        mockBusiness,
      );
      searchClient.upsertBusiness.mockResolvedValue(undefined);

      // Act
      await service.updateBusinessRating(businessId);

      // Assert
      expect((service as any).logger.log).toHaveBeenCalledWith(
        `Syncing business ratings with search engine ${mockBusiness}`,
      );
      expect((service as any).logger.log).toHaveBeenCalledWith(
        `Business rating updated for business ID: ${businessId}, new average rating: ${mockBusiness.averageRating}, review count: ${mockBusiness.reviewCount}`,
      );
    });
  });

  describe('syncBusinessWithSearchEngine', () => {
    it('should sync business with search engine and log the action', async () => {
      // Arrange
      searchClient.upsertBusiness.mockResolvedValue(undefined);

      // Act
      await (service as any).syncBusinessWithSearchEngine(mockBusiness);

      // Assert
      expect(BusinessMapper.toSearchPayload).toHaveBeenCalledWith(mockBusiness);
      expect(searchClient.upsertBusiness).toHaveBeenCalledWith(
        mockSearchPayload,
      );
      expect((service as any).logger.log).toHaveBeenCalledWith(
        `Syncing business ratings with search engine ${mockBusiness}`,
      );
    });
  });
});
