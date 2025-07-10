import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessOpeningHours } from './entities/business-opening-hours.entity';
import { UsersModule } from 'src/users/users.module';
import { BusinessService } from './services/business.service';
import { BusinessController } from './business.controller';
import { BusinessOpeningHoursService } from './services/business-opening-hours.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      BusinessOpeningHours,
    ]),
    UsersModule,
  ],
  controllers: [BusinessController],
  providers: [BusinessService, BusinessOpeningHoursService],
  exports: [BusinessService, BusinessOpeningHoursService],
})
export class BusinessModule {}
