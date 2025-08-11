import { CarFuel, CarType } from "../entities/car.enums";
import { ExpenseHistoryDto } from "../expense-history/dto/create-expense-history.dto";
import { CarReminderDto } from "../reminders/dto/create-reminder.dto";
import { ServiceHistoryDto } from "../service-history/dto/create-service-history.dto";
import { TireHistoryDto } from "../tire-history/dto/create-tire-history.dto";

export class CarResponseDto {
  id: string;
  owners: CarOwnerResponseDto[];
  brand: string;
  model: string;
  year?: number;
  type?: CarType;
  vin?: string;
  enginePower?: string;
  engineVolume?: string;
  euroStandard?: string;
  color?: string;
  photo?: string;
  licensePlate: string;
  oilType?: CarFuel;
  vignetteExpiry?: string;
  gtpExpiry?: string;
  civilInsuranceExpiry?: string;
  cascoExpiry?: string;
  taxExpiry?: string;
  mileage?: number;
  reminders?: CarReminderDto[];
  serviceHistory?: ServiceHistoryDto[];
  tireHistory?: TireHistoryDto[];
  expenseHistory?: ExpenseHistoryDto[];
}

export class CarOwnerResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string;
}