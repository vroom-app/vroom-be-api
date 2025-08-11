import { CarResponseDto } from './dto/car.dto';
import { Car } from './entities/car.entity';

export class CarMapper {
  static toCarResponseDto(car: Car): CarResponseDto {
    return {
    } as CarResponseDto;
  }

  static toCarResponseDtoArray(cars: Car[]): CarResponseDto[] {
    return cars.map((car) => this.toCarResponseDto(car));
  }
}
