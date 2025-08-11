import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { Car } from './entities/car.entity';
import { CarRepository } from './car.repository';
import { CreateCarDto, UpdateCarDto } from './dto/create-car.dto';
import { UserService } from 'src/users/user.service';
import { assertEntityPresent } from 'src/common/utils/assertEntity';
import { assertAffected } from 'src/common/utils/assertAffected';
import { CarMapper } from './car.mapper';
import { CarResponseDto } from './dto/car.dto';

@Injectable()
export class CarService {
  private readonly logger = new Logger(CarService.name);
  
  constructor(
    private readonly userService: UserService,
    private readonly carRepository: CarRepository,
  ) {}

  /**
   * Creates a new car entity in the database.
   * @param dto - The data transfer object containing car details.
   * @returns A promise that resolves to the created car entity.
   */
  async createCar(ownerId: number, dto: CreateCarDto): Promise<CarResponseDto> {
    this.logger.log(`Creating business for user ID: ${ownerId}`);
    const user = await this.userService.findById(ownerId);

    // TODO check user car number limit

    const carData: Partial<Car> = {
      ...dto,
      users: [user],
    };

    const car = assertEntityPresent(
      await this.carRepository.create(carData), 
      `Car creation failed for user ID ${ownerId}`
    );
    return CarMapper.toCarResponseDto(car);
  }

  /**
   * Finds a car by its ID and owner ID.
   * @param id - The ID of the car to be retrieved.
   * @param ownerId - The ID of the owner to check ownership.
   * @returns A promise that resolves to the car entity if found.
   * @throws NotFoundException if the car does not exist for the given owner.
   */
  async findById(id: string, ownerId: number): Promise<CarResponseDto> {
    const car = await this.carRepository.findUserCarById(id, ownerId);
    return CarMapper.toCarResponseDto(assertEntityPresent(car, `Car with ID ${id} not found for user ${ownerId}`));
  }

  /**
   * Finds all cars associated with a specific user.
   * @param userId - The ID of the user whose cars are to be retrieved.
   * @returns A promise that resolves to an array of car entities.
   */
  async findAllByUser(userId: number): Promise<CarResponseDto[]> {
    const cars = await this.carRepository.findAllByUser(userId);
    return CarMapper.toCarResponseDtoArray(cars);
  }

  /**
   * Deletes a car entity by its ID.
   * @param id - The ID of the car to be deleted.
   * @throws NotFoundException if the car does not exist.
   */
  async deleteById(id: string, ownerId: number): Promise<void> {
    assertAffected(
      await this.carRepository.deleteByOwnerIdAndCarId(id, ownerId), 
      `Car with ID ${id} not found`
    );
  }
  
  /**
   * Updates a car entity by its ID
   * @param carId - The ID of the car to be updated.
   * @param ownerId - The ID of the owner to check ownership.
   * @param dto - The data transfer object containing updated car details.
   * @returns A promise that resolves when the update is complete.
   * @throws NotFoundException if the car does not exist for the given owner.
   */
  async update(carId: string, ownerId: number, dto: UpdateCarDto): Promise<CarResponseDto> {
    let car = await this.carRepository.findUserCarById(carId, ownerId);
    
    car = assertEntityPresent(car, `Car with ID ${carId} not found for user ${ownerId}`);

    Object.assign(car, {
      licensePlate: dto.licensePlate ?? car.licensePlate,
      model: dto.model ?? car.model,
      brand: dto.brand ?? car.brand,
      year: dto.year ?? car.year,
      type: dto.type ?? car.type,
      vin: dto.vin ?? car.vin,
      enginePower: dto.enginePower ?? car.enginePower,
      engineVolume: dto.engineVolume ?? car.engineVolume,
      euroStandard: dto.euroStandard ?? car.euroStandard,
      color: dto.color ?? car.color,
      oilType: dto.oilType ?? car.oilType,
      mileage: dto.mileage ?? car.mileage,
      photo: dto.photo ?? car.photo,
    });

    assertAffected(
      await this.carRepository.updateCar(carId, car), 
      `Car with ID ${carId} not found`
    );
    
    return await this.findById(carId, ownerId);
  }
}
