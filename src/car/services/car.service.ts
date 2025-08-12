import {
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Car } from '../entities/car.entity';
import { CarRepository } from '../repositories/car.repository';
import { CreateCarDto, UpdateCarDto } from '../dto/car-management.dto';
import { UserService } from 'src/users/user.service';
import { assertEntityPresent } from 'src/common/utils/assertEntity';
import { assertAffected } from 'src/common/utils/assertAffected';
import { CarMapper } from '../mappers/car.mapper';
import { CarResponseDto } from '../dto/car-response.dto';
import { AppException } from 'src/common/dto/error.dto';

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

    await this.userCanCreateCar(ownerId);

    try {
      const carData: Partial<Car> = {
        ...dto,
        users: [user],
      };

      const car = assertEntityPresent(
        await this.carRepository.create(carData), 
        `Car creation failed for user ID ${ownerId}`
      );
      return CarMapper.toCarResponseDto(car);
    } catch (error) {
      this.logger.error(`Error creating car for user ID ${ownerId}: ${error.message}`);
      throw new AppException(
        "CAR_CREATION_FAILED",
        `Failed to create car for user ID ${ownerId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Finds a car by its ID and owner ID.
   * @param id - The ID of the car to be retrieved.
   * @param ownerId - The ID of the owner to check ownership.
   * @returns A promise that resolves to the car entity if found.
   * @throws NotFoundException if the car does not exist for the given owner.
   */
  async findById(id: string, ownerId: number): Promise<CarResponseDto> {
    this.logger.log(`Finding car with ID: ${id} for user ID: ${ownerId}`);
    try {
      const car = await this.carRepository.findUserCarById(id, ownerId);
      return CarMapper.toCarResponseDto(assertEntityPresent(car, `Car with ID ${id} not found for user ${ownerId}`));
    } catch (error) {
      this.logger.error(`Error finding car with ID ${id} for user ID ${ownerId}: ${error.message}`);
      throw new AppException(
        "CAR_NOT_FOUND",
        `Car with ID ${id} not found for user ID ${ownerId}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Finds all cars associated with a specific user.
   * @param userId - The ID of the user whose cars are to be retrieved.
   * @returns A promise that resolves to an array of car entities.
   */
  async findAllByUser(userId: number): Promise<CarResponseDto[]> {
    this.logger.log(`Finding all cars for user ID: ${userId}`);
    try {
      const cars = await this.carRepository.findAllByUser(userId);
      if (!cars || cars.length === 0) {
        this.logger.warn(`No cars found for user ID: ${userId}`);
        return [];
      }
      return CarMapper.toCarResponseDtoArray(cars)
    } catch (error) {
      this.logger.error(`Error finding cars for user ID ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deletes a car entity by its ID.
   * @param id - The ID of the car to be deleted.
   * @param ownerId - The ID of the owner to check ownership.
   * @returns A promise that resolves to true if the deletion was successful.
   * @throws NotFoundException if the car does not exist for the given owner.
   */
  async deleteById(id: string, ownerId: number): Promise<boolean> {
    this.logger.log(`Deleting car with ID: ${id} for user ID: ${ownerId}`);
    assertAffected(
      await this.carRepository.deleteByOwnerIdAndCarId(id, ownerId), 
      `Car with ID ${id} not found`
    );
    return true;
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
    this.logger.log(`Updating car with ID: ${carId} for user ID: ${ownerId}`);
    let car = await this.carRepository.findUserCarById(carId, ownerId);
    
    car = assertEntityPresent(car, `Car with ID ${carId} not found for user ${ownerId}`);

    try {
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
      return CarMapper.toCarResponseDto(car);
    } catch (error) {
      this.logger.error(`Error updating car with ID ${carId} for user ID ${ownerId}: ${error.message}`);
      throw new AppException(
        "CAR_UPDATE_FAILED",
        `Failed to update car with ID ${carId} for user ID ${ownerId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Checks if a user can create a new car.
   * @param ownerId - The ID of the user to check.
   * @throws Error if the user has reached the maximum number of cars allowed.
   * @returns A promise that resolves if the user can create a new car.
   */
  private async userCanCreateCar(ownerId: number): Promise<void> {
    this.logger.log(`Checking if user ID ${ownerId} can create a new car`);
    const carNumber = await this.carRepository.countByUserId(ownerId);
    if(!(carNumber <= 3)){
      this.logger.warn(`User ID ${ownerId} has reached the maximum number of cars`);
      throw new AppException(
        "CAR_QUOTA_REACHED",
        `User with ID ${ownerId} has reached the maximum number of cars (${3}).`,
        HttpStatus.BAD_REQUEST);
    } // Assuming a limit of 3 cars per user TODO: Make this configurable
  }
}
