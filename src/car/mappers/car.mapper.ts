import { CarResponseDto } from "../dto/car.dto";
import { Car } from '../entities/car.entity';

export class CarMapper {
  /**
   * Maps a Car entity to a CarResponseDto.
   * @param car - The Car entity to map.
   * @returns A CarResponseDto representing the car.
   */
  static toCarResponseDto(car: Car): CarResponseDto {
    return {
      id: car.id,
      owners: car.users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      })),
      brand: car.brand,
      model: car.model,
      year: car.year,
      type: car.type,
      vin: car.vin,
      enginePower: car.enginePower,
      engineVolume: car.engineVolume,
      euroStandard: car.euroStandard,
      color: car.color,
      photo: car.photo,
      licensePlate: car.licensePlate,
      oilType: car.oilType,
      vignetteExpiry: car.vignetteExpiry ? car.vignetteExpiry.toISOString() : undefined,
      gtpExpiry: car.gtpExpiry ? car.gtpExpiry.toISOString() : undefined,
      civilInsuranceExpiry: car.civilInsuranceExpiry ? car.civilInsuranceExpiry.toISOString() : undefined,
      cascoExpiry: car.cascoExpiry ? car.cascoExpiry.toISOString() : undefined,
      taxExpiry: car.taxExpiry ? car.taxExpiry.toISOString() : undefined,
      mileage: car.mileage,
      reminders: car.reminders ? car.reminders.map(reminder => ({
        type: reminder.type,
        dueDate: reminder.dueDate.toISOString(),
      })) : [],
      serviceHistory: car.serviceHistory ? car.serviceHistory.map(service => ({
        date: service.date.toISOString(),
        mileage: service.mileage,
        description: service.description,
      })) : [],
      tireHistory: car.tireHistory ? car.tireHistory.map(tire => ({
        date: tire.date.toISOString(),
        size: tire.size,
        type: tire.type,
      })) : [],
      expenseHistory: car.expenseHistory ? car.expenseHistory.map(expense => ({
        date: expense.date.toISOString(),
        type: expense.type,
        amount: expense.amount,
      })) : [],
    };
  }

  /**
   * Maps an array of Car entities to an array of CarResponseDto.
   * @param cars - The array of Car entities to map.
   * @returns An array of CarResponseDto representing the cars.
   */
  static toCarResponseDtoArray(cars: Car[]): CarResponseDto[] {
    return cars.map((car) => this.toCarResponseDto(car));
  }
}
