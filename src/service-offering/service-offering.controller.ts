import { Controller, Get, Query } from "@nestjs/common";
import { ServiceOfferingService } from "./service-offering.service";
import { ServiceOffering } from "./entities/service-offering.entity";

@Controller('offerings')
export class ServiceOfferingController {
    constructor(
        private readonly serviceOfferingService: ServiceOfferingService
    ) {}

    @Get()
    async findAllServiceOfferingForBusiness(
        @Query('businessId') businessId: number
    ): Promise<ServiceOffering[]> {
        return this.serviceOfferingService.findByBusinessId(businessId);
    }
}