import { Module } from '@nestjs/common';
import { BusinessManagementController } from './controller/business-management.controller';
import { BusinessModule } from 'src/business/business.module';
import { ServiceOfferingModule } from 'src/service-offering/service-offering.module';
import { SearchClientModule } from 'src/search-client/search-client.module';
import { BusinessManagementService } from './services/business-management.service';
import { ServiceOfferingManagementController } from './controller/service-offering-management.controller';
import { ServiceOfferingManagementService } from './services/service-offering-management.service';

@Module({
  imports: [BusinessModule, ServiceOfferingModule, SearchClientModule],
  controllers: [
    BusinessManagementController,
    ServiceOfferingManagementController,
  ],
  providers: [BusinessManagementService, ServiceOfferingManagementService],
  exports: [],
})
export class BusinessManagementModule {}
