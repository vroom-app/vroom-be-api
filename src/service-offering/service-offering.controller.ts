import { Controller } from "@nestjs/common";

@Controller('offerings')
export class ServiceOfferingController {
    constructor(
        private readonly serviceOfferingService: ServiceOfferingController
    ) {}
}