import { Controller, Get } from '@nestjs/common';
import { SpecializationService } from './specialization.service';
import { Specialization } from './entities/specialization.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Specializations')
@Controller('specialization')
export class SpecializationController {
  constructor(private readonly specializationService: SpecializationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all specializations' })
  @ApiResponse({
    status: 200,
    description: 'List of all specializations returned',
  })
  getAllSpecializations(): Promise<Specialization[]> {
    return this.specializationService.getAll();
  }
}
