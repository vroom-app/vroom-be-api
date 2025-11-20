import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewedService } from '../entities/review-service.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ReviewServiceRepository {
  private readonly logger = new Logger(ReviewServiceRepository.name);

  constructor(
    @InjectRepository(ReviewedService)
    private reviewServiceRepository: Repository<ReviewedService>,
  ) {}

  async createMultiple(
    reviewServicesData: Partial<ReviewedService>[],
    entityManager?: EntityManager,
  ): Promise<ReviewedService[]> {
    try {
      const repository = entityManager 
        ? entityManager.getRepository(ReviewedService) 
        : this.reviewServiceRepository;
      
      const reviewServices = repository.create(reviewServicesData);
      return await repository.save(reviewServices);
    } catch (error) {
      this.logger.error(
        `Failed to create review services: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
