import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CarFuel, CarType } from "../entities/car.enums";
import { ExpenseHistoryDto } from "../expense-history/dto/create-expense-history.dto";
import { CarReminderDto } from "../reminders/dto/create-reminder.dto";
import { ServiceHistoryDto } from "../service-history/dto/create-service-history.dto";
import { TireHistoryDto } from "../tire-history/dto/create-tire-history.dto";

/**
 * DTO for representing a car owner in the response.
 */
export class CarOwnerResponseDto {
  @ApiProperty({ description: 'Owner ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Owner first name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Owner last name', example: 'Doe' })
  lastName: string;

  @ApiPropertyOptional({ description: 'Photo URL of the owner', example: 'https://example.com/owner-photo.png' })
  photoUrl?: string;
}

/**
 * DTO for representing a car response.
 */
export class CarResponseDto {
  @ApiProperty({ description: 'Unique ID of the car', example: 'uuid-123' })
  id: string;

  @ApiProperty({ description: 'List of car owners', type: [CarOwnerResponseDto] })
  owners: CarOwnerResponseDto[];

  @ApiProperty({ description: 'Brand of the car', example: 'BMW' })
  brand: string;

  @ApiProperty({ description: 'Model of the car', example: '320d' })
  model: string;

  @ApiPropertyOptional({ description: 'Year of manufacture', example: 2019 })
  year?: number;

  @ApiPropertyOptional({ enum: CarType, description: 'Type of the car', example: CarType.Sedan })
  type?: CarType;

  @ApiPropertyOptional({ description: 'Vehicle Identification Number (VIN)', example: 'WBA8E91030K123456' })
  vin?: string;

  @ApiPropertyOptional({ description: 'Engine power', example: '190hp' })
  enginePower?: string;

  @ApiPropertyOptional({ description: 'Engine volume', example: '2.0L' })
  engineVolume?: string;

  @ApiPropertyOptional({ description: 'Euro emissions standard', example: 'Euro 6' })
  euroStandard?: string;

  @ApiPropertyOptional({ description: 'Car color', example: 'Син' })
  color?: string;

  @ApiPropertyOptional({ description: 'Photo URL of the car', example: 'https://example.com/car-photo.png' })
  photo?: string;

  @ApiProperty({ description: 'License plate number', example: 'CA1234AB' })
  licensePlate: string;

  @ApiPropertyOptional({ enum: CarFuel, description: 'Fuel type', example: CarFuel.DIESEL })
  oilType?: CarFuel;

  @ApiPropertyOptional({ description: 'Vignette expiry date (ISO 8601)', example: '2024-12-31' })
  vignetteExpiry?: string;

  @ApiPropertyOptional({ description: 'Technical inspection expiry date (ISO 8601)', example: '2024-09-15' })
  gtpExpiry?: string;

  @ApiPropertyOptional({ description: 'Civil insurance expiry date (ISO 8601)', example: '2024-10-01' })
  civilInsuranceExpiry?: string;

  @ApiPropertyOptional({ description: 'Casco insurance expiry date (ISO 8601)', example: '2024-11-20' })
  cascoExpiry?: string;

  @ApiPropertyOptional({ description: 'Car tax expiry date (ISO 8601)', example: '2024-12-31' })
  taxExpiry?: string;

  @ApiPropertyOptional({ description: 'Mileage in kilometers', example: 120000 })
  mileage?: number;

  @ApiPropertyOptional({ description: 'List of car reminders', type: [CarReminderDto] })
  reminders?: CarReminderDto[];

  @ApiPropertyOptional({ description: 'Service history records', type: [ServiceHistoryDto] })
  serviceHistory?: ServiceHistoryDto[];

  @ApiPropertyOptional({ description: 'Tire history records', type: [TireHistoryDto] })
  tireHistory?: TireHistoryDto[];

  @ApiPropertyOptional({ description: 'Expense history records', type: [ExpenseHistoryDto] })
  expenseHistory?: ExpenseHistoryDto[];
}