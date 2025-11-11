import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewedService } from '../entities/review-service.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewServiceRepository {
  private readonly logger = new Logger(ReviewServiceRepository.name);

  constructor(
    @InjectRepository(ReviewedService)
    private reviewServiceRepository: Repository<ReviewedService>,
  ) {}

  async createMultiple(
    reviewServicesData: Partial<ReviewedService>[],
  ): Promise<ReviewedService[]> {
    try {
      const reviewServices =
        this.reviewServiceRepository.create(reviewServicesData);
      return await this.reviewServiceRepository.save(reviewServices);
    } catch (error) {
      this.logger.error(
        `Failed to create review services: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
