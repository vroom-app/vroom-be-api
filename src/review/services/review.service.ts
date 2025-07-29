import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { ReviewResponseDto } from '../dto/review-response.dto';
import { ListReviewsDto } from '../dto/list-reviews.dto';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { BusinessService } from 'src/business/services/business.service';
import { ServiceOfferingService } from 'src/service-offering/service-offering.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private readonly businessService: BusinessService,
    private readonly serviceOfferingService: ServiceOfferingService,
  ) {}

  async createReview(
    createReviewDto: CreateReviewDto,
    userId: number,
  ): Promise<ReviewResponseDto> {
    const { businessId, serviceId, rating, comment } = createReviewDto;

    // Check if service exists (if provided)
    let serviceOffering: ServiceOffering;
    if (serviceId) {
      serviceOffering = await this.serviceOfferingService.findById(serviceId);
    }

    // Check if user already reviewed this business/service
    const existingReview = await this.reviewRepository.findOne({
      where: {
        businessId,
        userId,
        ...(serviceId && { serviceId }),
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        serviceId
          ? 'You have already reviewed this service'
          : 'You have already reviewed this business',
      );
    }

    // Create the review
    const review = this.reviewRepository.create({
      businessId,
      serviceId,
      userId,
      rating,
      comment,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Return the review with relations
    return this.getReviewWithRelations(savedReview.id);
  }

  async getBusinessReviews(
    businessId: string,
    listReviewsDto: ListReviewsDto,
  ): Promise<{
    reviews: ReviewResponseDto[];
    averageCommunication: number;
    averageQuality: number;
    averagePunctuality: number;
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, serviceId } = listReviewsDto;

    const whereClause = { businessId, ...(serviceId && { serviceId }) };
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: whereClause,
      relations: ['user', 'business', 'serviceOffering'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const { avgCommunication, avgQuality, avgPunctuality } =
      await this.reviewRepository
        .createQueryBuilder('review')
        .select('AVG(review.communicationRating)', 'avgCommunication')
        .addSelect('AVG(review.qualityRating)', 'avgQuality')
        .addSelect('AVG(review.punctualityRating)', 'avgPunctuality')
        .where('review.businessId = :businessId', { businessId })
        .andWhere(serviceId ? 'review.serviceId = :serviceId' : '1=1', {
          serviceId,
        })
        .getRawOne();

    return {
      reviews: reviews.map((r) => this.mapToResponseDto(r)),
      averageCommunication: parseFloat(avgCommunication) || 0,
      averageQuality: parseFloat(avgQuality) || 0,
      averagePunctuality: parseFloat(avgPunctuality) || 0,
      total,
      page,
      limit,
    };
  }

  async getUserReviews(
    userId: number,
    listReviewsDto: ListReviewsDto,
  ): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = listReviewsDto;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { userId },
      relations: ['user', 'business', 'serviceOffering'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const reviewResponseDtos = reviews.map((review) =>
      this.mapToResponseDto(review),
    );

    return {
      reviews: reviewResponseDtos,
      total,
      page,
      limit,
    };
  }

  async getBusinessAverageRating(
    businessId: string,
  ): Promise<{ averageRating: number; totalReviews: number }> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(review.id)', 'totalReviews')
      .where('review.businessId = :businessId', { businessId })
      .getRawOne();

    return {
      averageRating: parseFloat(result.averageRating) || 0,
      totalReviews: parseInt(result.totalReviews) || 0,
    };
  }

  private async getReviewWithRelations(
    reviewId: number,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['user', 'business', 'serviceOffering'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    return this.mapToResponseDto(review);
  }

  private mapToResponseDto(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      businessId: review.businessId,
      serviceId: review.serviceId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        id: review.user.id,
        firstName: review.user.firstName,
        lastName: review.user.lastName,
      },
      business: {
        id: review.business.id,
        name: review.business.name,
      },
      serviceOffering: review.serviceOffering
        ? {
            id: review.serviceOffering.id,
            name: review.serviceOffering.name,
          }
        : undefined,
    };
  }
}

function averageOptionalField<T extends keyof Review>(
  reviews: Review[],
  field: T,
): number {
  let sum = 0;
  let count = 0;

  for (const review of reviews) {
    const value = review[field];
    if (typeof value === 'number') {
      sum += value;
      count++;
    }
  }

  return count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;
}
