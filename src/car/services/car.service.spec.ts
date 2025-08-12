import { Test, TestingModule } from '@nestjs/testing';
import { CarService } from './car.service';
import { CarRepository } from '../car.repository';
import { UserService } from 'src/users/user.service';
import { AppException } from 'src/common/dto/error.dto';
import { CarMapper } from '../mappers/car.mapper';
import { Car } from '../entities/car.entity';
import { CreateCarDto, UpdateCarDto } from '../dto/create-car.dto';
import { assertEntityPresent } from 'src/common/utils/assertEntity';
import { assertAffected } from 'src/common/utils/assertAffected';
import { UpdateResult } from 'typeorm';

jest.mock('src/common/utils/assertEntity');
jest.mock('src/common/utils/assertAffected');
jest.mock('../mappers/car.mapper');

describe('CarService', () => {
  let service: CarService;
  let carRepository: jest.Mocked<CarRepository>;
  let userService: jest.Mocked<UserService>;

  const mockUser = { id: 1, firstName: 'John', lastName: 'Doe' } as any;
  const mockCar = { id: 'car-123', brand: 'BMW', model: '320d', users: [mockUser] } as Car;
  const mockCarDto: CreateCarDto = { licensePlate: 'CA1234AB', model: '320d', brand: 'BMW' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarService,
        {
          provide: CarRepository,
          useValue: {
            create: jest.fn(),
            findUserCarById: jest.fn(),
            findAllByUser: jest.fn(),
            deleteByOwnerIdAndCarId: jest.fn(),
            updateCar: jest.fn(),
            countByUserId: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CarService>(CarService);
    carRepository = module.get(CarRepository);
    userService = module.get(UserService);

    jest.clearAllMocks();
  });

  describe('createCar', () => {
    it('should create a car successfully', async () => {
      userService.findById.mockResolvedValue(mockUser);
      carRepository.countByUserId.mockResolvedValue(1);
      carRepository.create.mockResolvedValue(mockCar);
      (assertEntityPresent as jest.Mock).mockReturnValue(mockCar);
      (CarMapper.toCarResponseDto as jest.Mock).mockReturnValue({ id: 'car-123' });

      const result = await service.createCar(1, mockCarDto);
      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(carRepository.create).toHaveBeenCalledWith(expect.objectContaining({ brand: 'BMW' }));
      expect(result).toEqual({ id: 'car-123' });
    });

    it('should throw if user reached max car limit', async () => {
      carRepository.countByUserId.mockResolvedValue(4);
      await expect(service.createCar(1, mockCarDto)).rejects.toThrow(AppException);
    });

    it('should throw if creation fails', async () => {
      userService.findById.mockResolvedValue(mockUser);
      carRepository.countByUserId.mockResolvedValue(1);
      carRepository.create.mockRejectedValue(new Error('DB error'));

      await expect(service.createCar(1, mockCarDto)).rejects.toThrow(AppException);
    });
  });

  describe('findById', () => {
    it('should return a car dto', async () => {
      carRepository.findUserCarById.mockResolvedValue(mockCar);
      (assertEntityPresent as jest.Mock).mockReturnValue(mockCar);
      (CarMapper.toCarResponseDto as jest.Mock).mockReturnValue({ id: 'car-123' });

      const result = await service.findById('car-123', 1);
      expect(result).toEqual({ id: 'car-123' });
    });

    it('should throw if car not found', async () => {
      carRepository.findUserCarById.mockResolvedValue(null);
      (assertEntityPresent as jest.Mock).mockImplementation(() => { throw new Error(); });

      await expect(service.findById('car-123', 1)).rejects.toThrow(AppException);
    });
  });

  describe('findAllByUser', () => {
    it('should return empty array if no cars', async () => {
      carRepository.findAllByUser.mockResolvedValue([]);
      const result = await service.findAllByUser(1);
      expect(result).toEqual([]);
    });

    it('should map cars to DTO array', async () => {
      carRepository.findAllByUser.mockResolvedValue([mockCar]);
      (CarMapper.toCarResponseDtoArray as jest.Mock).mockReturnValue([{ id: 'car-123' }]);
      const result = await service.findAllByUser(1);
      expect(result).toEqual([{ id: 'car-123' }]);
    });
  });

  describe('deleteById', () => {
    it('should delete car successfully', async () => {
      carRepository.deleteByOwnerIdAndCarId.mockResolvedValue({ affected: 1, raw: [] });
      (assertAffected as jest.Mock).mockReturnValue(true);
      const result = await service.deleteById('car-123', 1);
      expect(result).toBe(true);
    });
  });

  describe('update', () => {
    it('should update and return car dto', async () => {
      const dto: UpdateCarDto = { model: '320i' };
      carRepository.findUserCarById.mockResolvedValue(mockCar);
      (assertEntityPresent as jest.Mock).mockReturnValue(mockCar);
      carRepository.updateCar.mockResolvedValue({ affected: 1 } as UpdateResult);
      (assertAffected as jest.Mock).mockReturnValue(true);
      (CarMapper.toCarResponseDto as jest.Mock).mockReturnValue({ id: 'car-123', model: '320i' });

      const result = await service.update('car-123', 1, dto);
      expect(result).toEqual({ id: 'car-123', model: '320i' });
    });
  });
});
