import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import configuration from './config/configurations';
import { User } from './users/entities/user.entity';
import { BookingModule } from './booking/booking.module';
import { BusinessModule } from './business/business.module';
import { ReviewModule } from './review/review.module';
import { ServiceOfferingModule } from './service-offering/service-offering.module';
import { SlotModule } from './slot/slot.module';
import { Specialization } from './specialization/entities/specialization.entity';
import { SpecializationModule } from './specialization/specialization.module';
import { Booking } from './booking/entities/booking.entity';
import { Business } from './business/entities/business.entity';
import { Review } from './review/entities/review.entity';
import { ServiceOffering } from './service-offering/entities/service-offering.entity';
import { Slot } from './slot/entities/slot.entity';
import { BusinessSpecialization } from './business/entities/business-specialization.entity';
import { BusinessOpeningHours } from './business/entities/business-opening-hours.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
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
        entities: [Booking, Business, BusinessSpecialization, BusinessOpeningHours, Review, ServiceOffering, Slot, Specialization, User],
        synchronize: process.env.NODE_ENV !== 'production',
      }),
    }),
    AuthModule,
    BookingModule,
    BusinessModule,
    ReviewModule,
    ServiceOfferingModule,
    SlotModule,
    SpecializationModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}