import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessOpeningHours } from './entities/business-opening-hours.entity';
import { UsersModule } from 'src/users/users.module';
import { BusinessService } from './services/business.service';
import { BusinessOpeningHoursService } from './services/business-opening-hours.service';
import { BusinessRepository } from './repositories/business.repository';
import { BusinessReviewService } from './services/business-review.service';
import { SearchClientModule } from 'src/search-client/search-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessOpeningHours]),
    UsersModule,
    SearchClientModule
  ],
  controllers: [],
  providers: [BusinessService, BusinessReviewService, BusinessOpeningHoursService, BusinessRepository],
  exports: [BusinessService, BusinessReviewService, BusinessOpeningHoursService],
})
export class BusinessModule {}

// user -> n business -> n service oferings -> n slot -> 1 booking // biz
// user -> n cars -> vignete,
