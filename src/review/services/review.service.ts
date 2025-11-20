import { Injectable, NotFoundException, Logger, HttpStatus } from '@nestjs/common';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import {
  PaginatedBusinessReviewsResponseDto,
  ReviewedServiceDto,
  ReviewResponseDto,
  UserSummaryDto,
} from '../dto/review-response.dto';
import { BusinessService } from 'src/business/services/business.service';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewServiceRepository } from '../repositories/review-service.repository';
import { User } from 'src/users/entities/user.entity';
import { ReviewedService } from '../entities/review-service.entity';
import { BusinessReviewService } from 'src/business/services/business-review.service';
import { AppException } from 'src/common/dto/error.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly reviewServiceRepository: ReviewServiceRepository,
    private readonly businessService: BusinessService,
    private readonly businessReviewService: BusinessReviewService,
    private readonly dataSource: DataSource,
  ) {}

  async createReview(
    createReviewDto: CreateReviewDto,
    userId: number,
  ): Promise<ReviewResponseDto> {
    await this.businessService.findBusinessAndValidateExistance(createReviewDto.businessId);

    return await this.dataSource.transaction(async (entityManager) => {
      const review = await this.createReviewEntity(createReviewDto, userId, entityManager);
      await this.createReviewServices(review.id, createReviewDto.serviceIds, entityManager);
      return review;
    })
    .then(async (review) => {
      this.updateBusinessRatingAsync(createReviewDto.businessId);
      return this.mapToReviewResponseDto(review);
    })
    .catch((error) => {
      this.handleReviewCreationError(error, createReviewDto);
    });
  }

  async getBusinessReviews(
    businessId: string,
    page: number = 1,
    limit: number = 5,
  ): Promise<PaginatedBusinessReviewsResponseDto> {
    try {
      const [reviews, total] =
        await this.reviewRepository.findByBusinessIdPaginated(
          businessId,
          page,
          limit,
        );
      const reviewDtos = reviews.map((review) =>
        this.mapToReviewResponseDto(review),
      );

      return {
        reviews: reviewDtos,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get reviews for business ${businessId}: ${error.message}`,
        error.stack,
      );
      throw new AppException(
        'REVIEW_NOT_FOUND',
        `Failed to get reviews for business ${businessId}: ${error.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  private async createReviewEntity(
    createReviewDto: CreateReviewDto, 
    userId: number, 
    entityManager: any
  ): Promise<Review> {
    const reviewData = {
      businessId: createReviewDto.businessId,
      userId: userId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      ratings: createReviewDto.ratings
        ? this.transformRatings(createReviewDto.ratings)
        : undefined,
    };

    return await this.reviewRepository.create(reviewData, entityManager);
  }

  private async createReviewServices(
    reviewId: number,
    serviceIds: number[],
    entityManager: any
  ): Promise<void> {
    if (!serviceIds?.length) return;

    const reviewServicesData = serviceIds.map((serviceId) => ({
      reviewId: reviewId,
      serviceId,
    }));

    await this.reviewServiceRepository.createMultiple(reviewServicesData, entityManager);
  }

  private handleReviewCreationError(error: any, createReviewDto: CreateReviewDto): never {
    this.logger.error(`Failed to create review: ${error.message}`);
    
    if (error.code === '23503') {
      throw new AppException(
        'INVALID_SERVICE_IDS',
        'One or more service IDs are invalid. Please check the provided services.',
        HttpStatus.BAD_REQUEST,
        {
          invalidServiceIds: createReviewDto.serviceIds,
          businessId: createReviewDto.businessId
        }
      );
    }
    
    if (error.code === '23505') {
      throw new AppException(
        'DUPLICATE_REVIEW',
        'You have already reviewed this business.',
        HttpStatus.CONFLICT
      );
    }
    
    throw new AppException(
      'REVIEW_CREATION_FAILED',
      `Failed to create review: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        originalError: error.message
      }
    );
  }

  private async updateBusinessRatingAsync(businessId: string): Promise<void> {
    try {
      await this.businessReviewService.updateBusinessRating(businessId);
    } catch (error) {
      this.logger.warn(`Failed to update business rating: ${error.message}`);
    }
  }

  private mapToReviewResponseDto(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      businessId: review.businessId,
      rating: review.rating,
      comment: review.comment,
      ratings: review.ratings as Record<string, number>,
      services:
        review.reviewServices?.map((rs) => this.mapToReviewedServiceDto(rs)) ??
        [],
      user: this.mapToUserSummaryDto(review.user),
      createdAt: review.createdAt,
    };
  }

  private mapToReviewedServiceDto(
    reviewService: ReviewedService,
  ): ReviewedServiceDto {
    return {
      id: reviewService.serviceOffering.id,
      name: reviewService.serviceOffering.name,
    };
  }

  private mapToUserSummaryDto(user: User): UserSummaryDto {
    return {
      id: user.id,
      username: user.firstName + ' ' + user.lastName,
      avatarUrl: user.avatarUrl,
    };
  }

  /**
   * Transform RatingDetailsDto to the expected ratings format
   */
  private transformRatings(
    ratings: any,
  ): { [key: string]: number } | undefined {
    if (!ratings) return undefined;

    return {
      communication: ratings.communication,
      quality: ratings.quality,
      punctuality: ratings.punctuality,
    };
  }
}
