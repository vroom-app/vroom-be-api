import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessOpeningHours } from './entities/business-opening-hours.entity';
import { UsersModule } from 'src/users/users.module';
import { BusinessService } from './services/business.service';
import { BusinessOpeningHoursService } from './services/business-opening-hours.service';
import { BusinessRepository } from './repositories/business.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessOpeningHours]),
    UsersModule,
  ],
  controllers: [],
  providers: [BusinessService, BusinessRepository, BusinessOpeningHoursService],
  exports: [BusinessService, BusinessOpeningHoursService],
})
export class BusinessModule {}

// user -> n business -> n service oferings -> n slot -> 1 booking // biz
// user -> n cars -> vignete,
