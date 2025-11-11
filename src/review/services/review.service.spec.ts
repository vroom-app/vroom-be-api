import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewServiceRepository } from '../repositories/review-service.repository';
import { BusinessService } from 'src/business/services/business.service';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { ReviewResponseDto } from '../dto/review-response.dto';
import { User } from 'src/users/entities/user.entity';
import { ReviewedService } from '../entities/review-service.entity';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { BusinessReviewService } from 'src/business/services/business-review.service';

describe('ReviewService', () => {
  let service: ReviewService;
  let reviewRepository: jest.Mocked<ReviewRepository>;
  let reviewServiceRepository: jest.Mocked<ReviewServiceRepository>;
  let businessService: jest.Mocked<BusinessService>;
  let businessReviewService: jest.Mocked<BusinessReviewService>;

  const mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: 'avatar.jpg',
    email: 'john@example.com',
  } as User;

  const mockServiceOffering: ServiceOffering = {
    id: 1,
    name: 'Test Service',
  } as ServiceOffering;

  const mockReviewedService: ReviewedService = {
    id: 1,
    reviewId: 1,
    serviceId: 1,
    serviceOffering: mockServiceOffering,
  } as ReviewedService;

  const mockReview: Review = {
    id: 1,
    businessId: 'business-123',
    userId: 1,
    rating: 4.5,
    comment: 'Great service!',
    ratings: { communication: 5, quality: 4, punctuality: 4 },
    createdAt: new Date(),
    user: mockUser,
    reviewServices: [mockReviewedService],
  } as Review;

  const createReviewDto: CreateReviewDto = {
    businessId: 'business-123',
    rating: 4.5,
    comment: 'Great service!',
    serviceIds: [1, 2],
    ratings: {
      communication: 5,
      quality: 4,
      punctuality: 4,
    },
  };

  const mockReviewResponseDto: ReviewResponseDto = {
    id: 1,
    businessId: 'business-123',
    rating: 4.5,
    comment: 'Great service!',
    ratings: { communication: 5, quality: 4, punctuality: 4 },
    services: [{ id: 1, name: 'Test Service' }],
    user: {
      id: 1,
      username: 'John Doe',
      avatarUrl: 'avatar.jpg',
    },
    createdAt: mockReview.createdAt,
  };

  const createMockReviewRepository = () => ({
    create: jest.fn(),
    findById: jest.fn(),
    findByBusinessIdPaginated: jest.fn(),
  });

  const createMockReviewServiceRepository = () => ({
    createMultiple: jest.fn(),
  });

  const createMockBusinessService = () => ({
    findBusinessAndValidateExistance: jest.fn(),
  });

  const createMockBusinessReviewService = () => ({
    updateBusinessRating: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: ReviewRepository,
          useValue: createMockReviewRepository(),
        },
        {
          provide: ReviewServiceRepository,
          useValue: createMockReviewServiceRepository(),
        },
        {
          provide: BusinessService,
          useValue: createMockBusinessService(),
        },
        {
          provide: BusinessReviewService,
          useValue: createMockBusinessReviewService(),
        },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    reviewRepository = module.get(ReviewRepository);
    reviewServiceRepository = module.get(ReviewServiceRepository);
    businessService = module.get(BusinessService);
    businessReviewService = module.get(BusinessReviewService);

    (service as any).logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    it('should successfully create a review', async () => {
      // Arrange
      const userId = 1;
      const createdReviewedServices: ReviewedService[] = [
        { ...mockReviewedService, serviceId: 1 },
        { ...mockReviewedService, serviceId: 2, id: 2 },
      ];

      businessService.findBusinessAndValidateExistance.mockResolvedValue(
        undefined,
      );
      reviewRepository.create.mockResolvedValue(mockReview);
      reviewServiceRepository.createMultiple.mockResolvedValue(
        createdReviewedServices,
      );
      reviewRepository.findById.mockResolvedValue(mockReview);

      // Act
      const result = await service.createReview(createReviewDto, userId);

      // Assert
      expect(
        businessService.findBusinessAndValidateExistance,
      ).toHaveBeenCalledWith(createReviewDto.businessId);
      expect(reviewRepository.create).toHaveBeenCalledWith({
        businessId: createReviewDto.businessId,
        userId: userId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        ratings: { communication: 5, quality: 4, punctuality: 4 },
      });
      expect(reviewServiceRepository.createMultiple).toHaveBeenCalledWith([
        { reviewId: mockReview.id, serviceId: 1 },
        { reviewId: mockReview.id, serviceId: 2 },
      ]);
      expect(businessReviewService.updateBusinessRating).toHaveBeenCalledWith(
        createReviewDto.businessId,
      );
      expect(reviewRepository.findById).toHaveBeenCalledWith(mockReview.id);
      expect(result).toEqual(mockReviewResponseDto);
    });

    it('should create review without ratings when ratings are not provided', async () => {
      // Arrange
      const userId = 1;
      const createReviewDtoWithoutRatings = {
        ...createReviewDto,
        ratings: undefined,
      };
      const createdReviewedServices: ReviewedService[] = [
        { ...mockReviewedService, serviceId: 1 },
        { ...mockReviewedService, serviceId: 2, id: 2 },
      ];

      businessService.findBusinessAndValidateExistance.mockResolvedValue(
        undefined,
      );
      reviewRepository.create.mockResolvedValue(mockReview);
      reviewServiceRepository.createMultiple.mockResolvedValue(
        createdReviewedServices,
      );
      reviewRepository.findById.mockResolvedValue(mockReview);

      // Act
      await service.createReview(createReviewDtoWithoutRatings, userId);

      // Assert
      expect(reviewRepository.create).toHaveBeenCalledWith({
        businessId: createReviewDto.businessId,
        userId: userId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        ratings: undefined,
      });
    });

    it('should throw NotFoundException when business does not exist', async () => {
      // Arrange
      const userId = 1;
      businessService.findBusinessAndValidateExistance.mockRejectedValue(
        new NotFoundException('Business not found'),
      );

      // Act & Assert
      await expect(
        service.createReview(createReviewDto, userId),
      ).rejects.toThrow(NotFoundException);
      expect(reviewRepository.create).not.toHaveBeenCalled();
      expect(reviewServiceRepository.createMultiple).not.toHaveBeenCalled();
    });

    it('should throw error when review creation fails', async () => {
      // Arrange
      const userId = 1;
      businessService.findBusinessAndValidateExistance.mockResolvedValue(
        undefined,
      );
      reviewRepository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.createReview(createReviewDto, userId),
      ).rejects.toThrow('Database error');
      expect(reviewServiceRepository.createMultiple).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when review not found after creation', async () => {
      // Arrange
      const userId = 1;
      const createdReviewedServices: ReviewedService[] = [
        { ...mockReviewedService, serviceId: 1 },
        { ...mockReviewedService, serviceId: 2, id: 2 },
      ];

      businessService.findBusinessAndValidateExistance.mockResolvedValue(
        undefined,
      );
      reviewRepository.create.mockResolvedValue(mockReview);
      reviewServiceRepository.createMultiple.mockResolvedValue(
        createdReviewedServices,
      );
      reviewRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.createReview(createReviewDto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle empty serviceIds array', async () => {
      // Arrange
      const userId = 1;
      const createReviewDtoWithoutServices = {
        ...createReviewDto,
        serviceIds: [],
      };
      const emptyReviewedServices: ReviewedService[] = [];

      businessService.findBusinessAndValidateExistance.mockResolvedValue(
        undefined,
      );
      reviewRepository.create.mockResolvedValue(mockReview);
      reviewServiceRepository.createMultiple.mockResolvedValue(
        emptyReviewedServices,
      );
      reviewRepository.findById.mockResolvedValue(mockReview);

      // Act
      await service.createReview(createReviewDtoWithoutServices, userId);

      // Assert
      expect(reviewServiceRepository.createMultiple).toHaveBeenCalledWith([]);
    });
  });

  describe('getBusinessReviews', () => {
    it('should return paginated business reviews', async () => {
      // Arrange
      const businessId = 'business-123';
      const page = 1;
      const limit = 5;
      const total = 1;
      reviewRepository.findByBusinessIdPaginated.mockResolvedValue([
        [mockReview],
        total,
      ]);

      // Act
      const result = await service.getBusinessReviews(businessId, page, limit);

      // Assert
      expect(reviewRepository.findByBusinessIdPaginated).toHaveBeenCalledWith(
        businessId,
        page,
        limit,
      );
      expect(result).toEqual({
        reviews: [mockReviewResponseDto],
        total,
        page,
        limit,
      });
    });

    it('should use default pagination values when not provided', async () => {
      // Arrange
      const businessId = 'business-123';
      const total = 1;
      reviewRepository.findByBusinessIdPaginated.mockResolvedValue([
        [mockReview],
        total,
      ]);

      // Act
      await service.getBusinessReviews(businessId);

      // Assert
      expect(reviewRepository.findByBusinessIdPaginated).toHaveBeenCalledWith(
        businessId,
        1,
        5,
      );
    });

    it('should handle empty reviews list', async () => {
      // Arrange
      const businessId = 'business-123';
      const page = 1;
      const limit = 5;
      const total = 0;
      reviewRepository.findByBusinessIdPaginated.mockResolvedValue([[], total]);

      // Act
      const result = await service.getBusinessReviews(businessId, page, limit);

      // Assert
      expect(result).toEqual({
        reviews: [],
        total: 0,
        page: 1,
        limit: 5,
      });
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      const businessId = 'business-123';
      reviewRepository.findByBusinessIdPaginated.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.getBusinessReviews(businessId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('transformRatings', () => {
    it('should transform ratings correctly', () => {
      // Arrange
      const ratings = {
        communication: 5,
        quality: 4,
        punctuality: 3,
      };

      // Act
      const result = (service as any).transformRatings(ratings);

      // Assert
      expect(result).toEqual({
        communication: 5,
        quality: 4,
        punctuality: 3,
      });
    });

    it('should return undefined when ratings are null', () => {
      // Act
      const result = (service as any).transformRatings(null);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined when ratings are undefined', () => {
      // Act
      const result = (service as any).transformRatings(undefined);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('mapToReviewResponseDto', () => {
    it('should map review to response DTO correctly', () => {
      // Act
      const result = (service as any).mapToReviewResponseDto(mockReview);

      // Assert
      expect(result).toEqual(mockReviewResponseDto);
    });

    it('should handle review without reviewServices', () => {
      // Arrange
      const reviewWithoutServices = {
        ...mockReview,
        reviewServices: undefined,
      };

      // Act
      const result = (service as any).mapToReviewResponseDto(
        reviewWithoutServices,
      );

      // Assert
      expect(result.services).toEqual([]);
    });
  });
});
