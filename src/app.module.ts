import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import configuration from './config/configurations';
import { User } from './users/entities/user.entity';
import { BusinessModule } from './business/business.module';
import { ServiceOfferingModule } from './service-offering/service-offering.module';
import { Booking } from './booking/entities/booking.entity';
import { Business } from './business/entities/business.entity';
import { Review } from './review/entities/review.entity';
import { ServiceOffering } from './service-offering/entities/service-offering.entity';
import { Slot } from './slot/entities/slot.entity';
import { BusinessOpeningHours } from './business/entities/business-opening-hours.entity';
import { BusinessManagementModule } from './business-management/business-manager.module';
import { Car } from './car/entities/car.entity';
import { CarModule } from './car/car.module';
import { BusinessPhotoModule } from './buisness-photo/business-photo.module';
import { CarReminder } from './car/reminders/entities/reminder.entity';
import { ServiceHistory } from './car/service-history/entities/service-history.entity';
import { TireHistory } from './car/tire-history/entities/tire-history.entity';
import { ExpenseHistory } from './car/expense-history/entities/expense-history.entity';
import { ReviewedService } from './review/entities/review-service.entity';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'dev'}`,
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get<number>('database.port'),

        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        ssl: {
          rejectUnauthorized: false,
        },
        entities: [
          Booking,
          BusinessOpeningHours,
          Business,
          Review,
          ReviewedService,
          ServiceOffering,
          Slot,
          User,
          CarReminder,
          ServiceHistory,
          TireHistory,
          ExpenseHistory,
          Car,
        ],
        synchronize: process.env.NODE_ENV !== 'prod',
      }),
    }),
    AuthModule,
    // BookingModule,
    BusinessModule,
    BusinessPhotoModule,
    BusinessManagementModule,
    ReviewModule,
    ServiceOfferingModule,
    // SlotModule,
    UsersModule,
    CarModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
