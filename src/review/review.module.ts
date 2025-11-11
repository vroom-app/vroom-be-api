import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewController } from './review.controller';
import { ReviewService } from './services/review.service';
import { BusinessModule } from 'src/business/business.module';
import { ServiceOfferingModule } from 'src/service-offering/service-offering.module';
import { ReviewedService } from './entities/review-service.entity';
import { ReviewServiceRepository } from './repositories/review-service.repository';
import { ReviewRepository } from './repositories/review.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ReviewedService]),
    BusinessModule,
    ServiceOfferingModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewServiceRepository, ReviewRepository],
  exports: [ReviewService],
})
export class ReviewModule {}
