import { Module } from "@nestjs/common";
import { Booking } from "./entities/booking.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookingController } from "./booking.controller";
import { BookingService } from "./service/booking.service";
import { UsersModule } from "src/users/users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Booking]),
        UsersModule,
    ],
    controllers: [BookingController],
    providers: [BookingService],
    exports: [BookingService]
})
export class BookingModule {}