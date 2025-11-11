import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CarReminderService } from './services/reminders.service';

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cars/:carId/reminders')
export class CarReminderController {
  constructor(private readonly service: CarReminderService) {}
}
