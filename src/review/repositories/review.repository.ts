import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewRepository {
  private readonly logger = new Logger(ReviewRepository.name);

  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(reviewData: Partial<Review>): Promise<Review> {
    try {
      const review = this.reviewRepository.create(reviewData);
      return await this.reviewRepository.save(review);
    } catch (error) {
      this.logger.error(`Failed to create review: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByBusinessIdPaginated(
    businessId: string, 
    page: number, 
    limit: number
  ): Promise<[Review[], number]> {
    try {
      return await this.reviewRepository.findAndCount({
        where: { businessId },
        relations: ['user', 'reviewServices', 'reviewServices.serviceOffering'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
    } catch (error) {
      this.logger.error(
        `Failed to find reviews for business ${businessId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async findById(id: number): Promise<Review | null> {
    try {
      return await this.reviewRepository.findOne({
        where: { id },
        relations: ['user', 'reviewServices', 'reviewServices.serviceOffering'],
      });
    } catch (error) {
      this.logger.error(`Failed to find review by id ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
