import { Module } from '@nestjs/common';
import { BusinessManagementController } from './business-management.controller';
import { BusinessModule } from 'src/business/business.module';
import { ServiceOfferingModule } from 'src/service-offering/service-offering.module';
import { SearchClientModule } from 'src/search-client/search-client.module';
import { BusinessManagementService } from './services/business-management.service';

@Module({
  imports: [BusinessModule, ServiceOfferingModule, SearchClientModule],
  controllers: [BusinessManagementController],
  providers: [BusinessManagementService],
  exports: [],
})
export class BusinessManagementModule {}
