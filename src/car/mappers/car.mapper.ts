import { CarResponseDto } from '../dto/car-response.dto';
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
      owners: this.mapOwners(car),
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
      vignetteExpiry: this.mapDate(car.vignetteExpiry),
      gtpExpiry: this.mapDate(car.gtpExpiry),
      civilInsuranceExpiry: this.mapDate(car.civilInsuranceExpiry),
      cascoExpiry: this.mapDate(car.cascoExpiry),
      taxExpiry: this.mapDate(car.taxExpiry),
      mileage: car.mileage,
      reminders: this.mapReminders(car),
      serviceHistory: this.mapServiceHistory(car),
      tireHistory: this.mapTireHistory(car),
      expenseHistory: this.mapExpenseHistory(car),
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

  // ---------- Private mapping helpers ----------

  private static mapOwners(car: Car) {
    return car.users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }));
  }

  private static mapDate(date?: Date) {
    return date ? date.toISOString() : undefined;
  }

  private static mapReminders(car: Car) {
    return (
      car.reminders?.map((reminder) => ({
        type: reminder.type,
        dueDate: this.mapDate(reminder.dueDate),
      })) ?? []
    );
  }

  private static mapServiceHistory(car: Car) {
    return (
      car.serviceHistory?.map((service) => ({
        date: this.mapDate(service.date)!,
        mileage: service.mileage,
        description: service.description,
      })) ?? []
    );
  }

  private static mapTireHistory(car: Car) {
    return (
      car.tireHistory?.map((tire) => ({
        date: this.mapDate(tire.date)!,
        size: tire.size,
        type: tire.type,
      })) ?? []
    );
  }

  private static mapExpenseHistory(car: Car) {
    return (
      car.expenseHistory?.map((expense) => ({
        date: this.mapDate(expense.date)!,
        type: expense.type,
        amount: expense.amount,
      })) ?? []
    );
  }
}
