import { Controller } from "@nestjs/common";
import { SpecializationService } from "./specialization.service";

@Controller('specializations')
export class SpecializationController {
    constructor(
        private readonly specializationService: SpecializationService
    ) {}
}