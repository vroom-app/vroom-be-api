import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarReminder } from "./entities/reminder.entity";
import { CarReminderService } from "./reminders.service";
import { CarReminderController } from "./reminders.controller";
import { CarReminderRepository } from "./reminders.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([CarReminder]),
  ],
  providers: [CarReminderService, CarReminderRepository],
  controllers: [CarReminderController],
})
export class CarReminderModule {}
