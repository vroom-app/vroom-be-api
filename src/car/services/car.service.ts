import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '../entities/car.entity';
import { Repository } from 'typeorm';
import { CreateCarDto } from '../dto/create-car.dto';
import { UserService } from 'src/users/user.service';
import { CarFuel } from '../entities/car-fuel';
import { CarResponseDto } from '../dto/car.dto';
import { CarMapper } from '../car.mapper';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    private readonly userService: UserService,
  ) {}

  async create(createCarDto: CreateCarDto, userId: number): Promise<CarResponseDto> {
    await this.userService.findOne(userId);

    const car = this.carRepository.create({
      ...createCarDto,
      fuel: createCarDto.fuel ?? CarFuel.OTHER,
      userId,
    });

    const savedCar = await this.carRepository.save(car);

    return CarMapper.toCarResponseDto(savedCar);
  }

  async findAllByUser(userId: number): Promise<CarResponseDto[]> {
    const cars = await this.carRepository.find({ where: { userId } });
    return CarMapper.toCarResponseDtoArray(cars);
  }

  async deleteById(carId: string, userId: number): Promise<void> {
    const car = await this.carRepository.findOne({ where: { id: carId } });

    if (!car) {
      throw new NotFoundException(`Car with id ${carId} not found`);
    }

    if (car.userId !== userId) {
      throw new ForbiddenException(`You do not have permission to delete this car`);
    }

    await this.carRepository.delete(carId);
  }
}