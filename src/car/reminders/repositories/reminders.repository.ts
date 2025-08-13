import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CarReminder } from "./entities/reminder.entity";

@Injectable()
export class CarReminderRepository {
    constructor(@InjectRepository(CarReminder) private readonly repository: Repository<CarReminder>) {}
}
