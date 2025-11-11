import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TireHistoryService } from './services/tire-history.service';

@ApiTags('Tire History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cars/:carId/tire-history')
export class TireHistoryController {
  constructor(private readonly tireHistoryService: TireHistoryService) {}
}
