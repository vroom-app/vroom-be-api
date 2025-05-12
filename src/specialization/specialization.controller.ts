import { Controller, Get } from "@nestjs/common";
import { SpecializationService } from "./specialization.service";
import { Specialization } from "./entities/specialization.entity";

@Controller('specialization')
export class SpecializationController {
    constructor(
        private readonly specializationService: SpecializationService
    ) {}

    
    /**
     * Get all specializations
     * @returns Array of all specializations
     */
    @Get()
    getAllSpecializations(): Promise<Specialization[]> {
        return this.specializationService.getAll();
    }
}