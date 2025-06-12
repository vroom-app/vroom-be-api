import { Module } from "@nestjs/common";
import { Booking } from "./entities/booking.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookingController } from "./booking.controller";
import { BookingService } from "./service/booking.service";
import { UsersModule } from "src/users/users.module";
import { BookingDtoService } from "./service/booking-dto.service";
import { BookingCreationService } from "./service/booking-creation.service";
import { BusinessService } from "src/business/services/business.service";
import { BusinessModule } from "src/business/business.module";
import { BookingQueryService } from "./service/booking-query.service";
import { SlotModule } from "src/slot/slot.module";
import { ServiceOfferingModule } from "src/service-offering/service-offering.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Booking]),
        UsersModule,
        BusinessModule,
        SlotModule,
        ServiceOfferingModule
    ],
    controllers: [BookingController],
    providers: [
        BookingService, 
        BookingDtoService, 
        BookingCreationService,
        BookingQueryService
    ],
    exports: []
})
export class BookingModule {}