import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from './entities/slot.entity';
import { UsersModule } from 'src/users/users.module';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';
import { BusinessModule } from 'src/business/business.module';
import { ServiceOfferingModule } from 'src/service-offering/service-offering.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Slot]),
    UsersModule,
    BusinessModule,
    ServiceOfferingModule,
  ],
  controllers: [SlotController],
  providers: [SlotService],
  exports: [SlotService],
})
export class SlotModule {}
