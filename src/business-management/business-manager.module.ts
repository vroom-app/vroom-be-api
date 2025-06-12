import { Module } from "@nestjs/common";
import { BusinessManagementController } from "./business-management.controller";
import { BusinessModule } from "src/business/business.module";
import { ServiceOfferingModule } from "src/service-offering/service-offering.module";
import { BusinessManagementService } from "./service/business-management.service";

@Module({
    imports: [
        BusinessModule, 
        ServiceOfferingModule
    ],
    controllers: [
        BusinessManagementController
    ],
    providers: [
        BusinessManagementService
    ],
    exports: []
})
export class BusinessManagementModule {}