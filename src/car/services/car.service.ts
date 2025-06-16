import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Car } from "../entities/car.entity";
import { Repository } from "typeorm";
import { CreateCarDto } from "../dto/create-car.dto";
import { UserService } from "src/users/user.service";

@Injectable()
export class CarService {
    constructor(
        @InjectRepository(Car)
        private readonly carRepository: Repository<Car>,
        private readonly userService: UserService
    ) {}

    async create(
        createCarDto: CreateCarDto, 
        userId: number
    ): Promise<Car> {
        const user = await this.userService.findOne(userId);

        const car = this.carRepository.create({
            ...createCarDto,
            user,
        });

        return this.carRepository.save(car);
    }

    async findAllByUser(userId: string): Promise<Car[]> {
        return this.carRepository.find({ where: { userId } });
    }
}