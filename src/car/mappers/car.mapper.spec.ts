import { Car } from '../entities/car.entity';
import { CarMapper } from './car.mapper';

describe('CarMapper', () => {
  it('should map Car entity to CarResponseDto', () => {
    const date = new Date('2024-01-01');
    const car = {
      id: 'car-123',
      brand: 'BMW',
      model: '320d',
      users: [{ id: 1, firstName: 'John', lastName: 'Doe', email: 'test@example.com' }],
      vignetteExpiry: date,
      reminders: [{ type: 'Масло', dueDate: date }],
      serviceHistory: [{ date, mileage: 120000, description: 'Oil change' }],
      tireHistory: [{ date, size: '225/50R17', type: 'Зимни' }],
      expenseHistory: [{ date, type: 'Гориво', amount: 100 }],
    } as unknown as Car;

    const dto = CarMapper.toCarResponseDto(car);
    expect(dto.id).toBe('car-123');
    expect(dto.owners[0].id).toBe(1);
    expect(dto.reminders && dto.reminders[0].dueDate).toBe(date.toISOString());
  });

  it('should map empty optional arrays', () => {
    const car = {
      id: 'car-123',
      brand: 'BMW',
      model: '320d',
      users: [],
    } as unknown as Car;

    const dto = CarMapper.toCarResponseDto(car);
    expect(dto.reminders).toEqual([]);
    expect(dto.serviceHistory).toEqual([]);
    expect(dto.tireHistory).toEqual([]);
    expect(dto.expenseHistory).toEqual([]);
  });

  it('should map array of cars', () => {
    const cars = [
      { id: '1', brand: 'BMW', model: '320d', users: [] } as unknown as Car,
      { id: '2', brand: 'Audi', model: 'A4', users: [] } as unknown as Car,
    ];
    const result = CarMapper.toCarResponseDtoArray(cars);
    expect(result.length).toBe(2);
  });
});