import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOfferingService } from './services/service-offering.service';
import { ServiceOffering } from './entities/service-offering.entity';
import { ServiceOfferingRepository } from './repositories/service-offering.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceOffering])],
  controllers: [],
  providers: [ServiceOfferingService, ServiceOfferingRepository],
  exports: [ServiceOfferingService],
})
export class ServiceOfferingModule {}
