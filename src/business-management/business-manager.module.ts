import { Module } from '@nestjs/common';
import { BusinessManagementController } from './business-management.controller';
import { BusinessManagementService } from './business-management.service';
import { BusinessModule } from 'src/business/business.module';
import { ServiceOfferingModule } from 'src/service-offering/service-offering.module';
import { GooglePlacesModule } from 'src/google-places/google-places.module';

@Module({
  imports: [BusinessModule, ServiceOfferingModule, GooglePlacesModule],
  controllers: [BusinessManagementController],
  providers: [BusinessManagementService],
  exports: [],
})
export class BusinessManagementModule {}
