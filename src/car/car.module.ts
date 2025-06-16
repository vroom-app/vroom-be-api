import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Car } from "./entities/car.entity";
import { CarController } from "./car.controller";
import { CarService } from "./services/car.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([ Car ])
    ],
    providers: [
        CarService
    ],
    controllers: [
        CarController
    ],
})
export class CarModule {}