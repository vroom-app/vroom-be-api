import { Injectable, Logger } from '@nestjs/common';
import { CarReminderRepository } from '../repositories/reminders.repository';

@Injectable()
export class CarReminderService {
  private readonly logger = new Logger(CarReminderService.name);

  constructor(private readonly repository: CarReminderRepository) {}
}
