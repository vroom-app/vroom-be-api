import { Controller } from "@nestjs/common";
import { ServiceOfferingService } from "./service-offering.service";

@Controller('service-offering')
export class ServiceOfferingController {
    constructor(private readonly serviceOfferingService: ServiceOfferingService) {}
}