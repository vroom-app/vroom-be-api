import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewRepository {
  private readonly logger = new Logger(ReviewRepository.name);

  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(
    reviewData: Partial<Review>, 
    entityManager?: EntityManager
  ): Promise<Review> {
    try {
      const repository = entityManager ? entityManager.getRepository(Review) : this.reviewRepository;
      const review = repository.create(reviewData);
      return await repository.save(review);
    } catch (error) {
      this.logger.error(
        `Failed to create review: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByBusinessIdPaginated(
    businessId: string,
    page: number,
    limit: number,
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
        error.stack,
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
      this.logger.error(
        `Failed to find review by id ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByBusinessAndUser(businessId: string, userId: number): Promise<Review | null> {
    return this.reviewRepository.findOne({
      where: { businessId, userId },
    });
  }
}
