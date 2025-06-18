import { CarFuel } from '../entities/car-fuel';

export class CarResponseDto {
  id: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  fuel: CarFuel;
  color?: string;
}
