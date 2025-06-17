import { CarResponseDto } from "./dto/car.dto";
import { Car } from "./entities/car.entity";

export class CarMapper {
  static toCarResponseDto(car: Car): CarResponseDto {
    return {
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      plateNumber: car.plateNumber,
      fuel: car.fuel,
      color: car.color,
    };
  }

  static toCarResponseDtoArray(cars: Car[]): CarResponseDto[] {
    return cars.map(car => this.toCarResponseDto(car));
  }
}