import { ReminderType } from 'src/car/entities/car.enums';

export class CarReminderDto {
  type: ReminderType;
  dueDate?: string;
}
