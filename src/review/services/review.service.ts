import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { ServiceOfferingService } from 'src/service-offering/services/service-offering.service';
import { PaginatedBusinessReviewsResponseDto, ReviewedServiceDto, ReviewResponseDto, UserSummaryDto } from '../dto/review-response.dto';
import { BusinessService } from 'src/business/services/business.service';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewServiceRepository } from '../repositories/review-service.repository';
import { User } from 'src/users/entities/user.entity';
import { ReviewedService } from '../entities/review-service.entity';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly reviewServiceRepository: ReviewServiceRepository,
    private readonly businessService: BusinessService,
  ) {}

  async createReview(
    createReviewDto: CreateReviewDto, 
    userId: number
  ): Promise<ReviewResponseDto> {
    let review: Review;

    try {
      // Validate business exists
      await this.businessService.findBusinessAndValidateExistance(createReviewDto.businessId);

      // Create review - fix the ratings type issue
      const reviewData = {
        businessId: createReviewDto.businessId,
        userId: userId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        ratings: createReviewDto.ratings ? this.transformRatings(createReviewDto.ratings) : undefined,
      };

      review = await this.reviewRepository.create(reviewData);

      // Create review-service relationships
      const reviewServicesData = createReviewDto.serviceIds.map(serviceId => ({
        reviewId: review.id,
        serviceId,
      }));

      await this.reviewServiceRepository.createMultiple(reviewServicesData);

      // Update business rating async
      this.businessService.updateBusinessRating(createReviewDto.businessId);

      // Return the complete review with relations
      const completeReview = await this.reviewRepository.findById(review.id);
      if (!completeReview) {
        this.logger.error('Review not found after creation');
        throw new NotFoundException('Review not found after creation');
      }
      return this.mapToReviewResponseDto(completeReview);

    } catch (error) {
      this.logger.error(`Failed to create review: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getBusinessReviews(
    businessId: string, 
    page: number = 1, 
    limit: number = 5
  ): Promise<PaginatedBusinessReviewsResponseDto> {
    try {
      const [reviews, total] = await this.reviewRepository.findByBusinessIdPaginated(
        businessId, 
        page, 
        limit
      );
      const reviewDtos = reviews.map(review => this.mapToReviewResponseDto(review));

      return {
        reviews: reviewDtos,
        total,
        page,
        limit,
      };

    } catch (error) {
      this.logger.error(
        `Failed to get reviews for business ${businessId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  private mapToReviewResponseDto(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      businessId: review.businessId,
      rating: review.rating,
      comment: review.comment,
      ratings: review.ratings as Record<string, number>,
      services: review.reviewServices?.map(rs => this.mapToReviewedServiceDto(rs)) ?? [],
      user: this.mapToUserSummaryDto(review.user),
      createdAt: review.createdAt,
    };
  }

  private mapToReviewedServiceDto(reviewService: ReviewedService): ReviewedServiceDto {
    return {
      id: reviewService.serviceOffering.id,
      name: reviewService.serviceOffering.name
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
  private transformRatings(ratings: any): { [key: string]: number} | undefined  {
    if (!ratings) return undefined;
    
    return {
      communication: ratings.communication,
      quality: ratings.quality,
      punctuality: ratings.punctuality,
    };
  }
}
