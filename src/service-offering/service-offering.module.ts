import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServiceOfferingController } from "./service-offering.controller";
import { ServiceOfferingService } from "./service-offering.service";
import { ServiceOffering } from "./entities/service-offering.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([ServiceOffering])
    ],
    controllers: [ServiceOfferingController],
    providers: [ServiceOfferingService],
    exports: [ServiceOfferingService]
})
export class ServiceOfferingModule {}