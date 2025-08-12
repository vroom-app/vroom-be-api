import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from './entities/car.entity';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { UsersModule } from 'src/users/users.module';
import { TireHistoryModule } from './tire-history/tire-history.module';
import { ServiceHistoryModule } from './service-history/service-history.module';
import { CarReminderModule } from './reminders/reminders.module';
import { ExpenseHistoryModule } from './expense-history/expense-history.module';
import { CarRepository } from './car.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Car]),
    UsersModule,
    ExpenseHistoryModule,
    TireHistoryModule,
    ServiceHistoryModule,
    CarReminderModule,
  ],
  providers: [CarService, CarRepository],
  controllers: [CarController],
})
export class CarModule {}
