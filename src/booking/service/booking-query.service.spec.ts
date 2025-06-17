import { Test, TestingModule } from '@nestjs/testing';
import { BookingQueryService } from './booking-query.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from '../entities/booking.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BookingStatus } from '../entities/booking.entity';
import { BookingQueryOptions } from '../interfaces/booking-query-options.interface';

describe('BookingQueryService', () => {
  let service: BookingQueryService;
  let repository: Repository<Booking>;

  // Mocks for queryBuilder chain
  const createQueryBuilderMock: Partial<SelectQueryBuilder<Booking>> = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingQueryService,
        {
          provide: getRepositoryToken(Booking),
          useValue: {
            createQueryBuilder: jest.fn(() => createQueryBuilderMock),
          },
        },
      ],
    }).compile();

    service = module.get<BookingQueryService>(BookingQueryService);
    repository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockBookings = [{ id: 1 }, { id: 2 }] as Booking[];
  const mockTotal = 2;

  const mockReturn = [mockBookings, mockTotal];

  it('should return bookings using businessId context', async () => {
    (createQueryBuilderMock.getManyAndCount as jest.Mock).mockResolvedValue(
      mockReturn,
    );

    const options: BookingQueryOptions = {
      status: BookingStatus.CONFIRMED,
      fromDate: new Date('2024-01-01'),
      toDate: new Date('2024-12-31'),
      sortBy: 'slotStartTime',
      sortOrder: 'ASC',
      page: 1,
      limit: 10,
    };

    const context: BookingQueryContext = {
      businessId: 123,
      isBusinessOwner: true,
      canViewAllBookings: true,
    };

    const result = await service.findBookingsWithPagination(options, context);

    expect(result).toEqual({ bookings: mockBookings, total: mockTotal });
    expect(createQueryBuilderMock.where).toHaveBeenCalledWith(
      'business.id = :businessId',
      { businessId: 123 },
    );
  });

  it('should return bookings using userId context', async () => {
    (createQueryBuilderMock.getManyAndCount as jest.Mock).mockResolvedValue(
      mockReturn,
    );

    const options: BookingQueryOptions = {
      status: BookingStatus.CANCELLED,
      sortBy: 'status',
      sortOrder: 'DESC',
      page: 1,
      limit: 10,
    };

    const context: BookingQueryContext = {
      userId: 456,
      isBusinessOwner: false,
      canViewAllBookings: false,
    };

    const result = await service.findBookingsWithPagination(options, context);

    expect(result).toEqual({ bookings: mockBookings, total: mockTotal });
    expect(createQueryBuilderMock.where).toHaveBeenCalledWith(
      'booking.userId = :userId',
      { userId: 456 },
    );
    expect(createQueryBuilderMock.orderBy).toHaveBeenCalledWith(
      'booking.status',
      'DESC',
    );
  });

  it('should default to booking.createdAt when sortBy is not provided', async () => {
    (createQueryBuilderMock.getManyAndCount as jest.Mock).mockResolvedValue(
      mockReturn,
    );

    const options: BookingQueryOptions = {
      page: 1,
      limit: 10,
    };

    const context: BookingQueryContext = {
      businessId: 1,
      isBusinessOwner: true,
      canViewAllBookings: true,
    };

    const result = await service.findBookingsWithPagination(options, context);

    expect(result).toEqual({ bookings: mockBookings, total: mockTotal });
    expect(createQueryBuilderMock.orderBy).toHaveBeenCalledWith(
      'booking.createdAt',
      'DESC',
    );
  });

  it('should support custom pagination: page 2, limit 5', async () => {
    (createQueryBuilderMock.getManyAndCount as jest.Mock).mockResolvedValue(
      mockReturn,
    );

    const options: BookingQueryOptions = {
      page: 2,
      limit: 5,
      sortBy: 'status',
      sortOrder: 'ASC',
    };

    const context: BookingQueryContext = {
      businessId: 1,
      isBusinessOwner: true,
      canViewAllBookings: true,
    };

    const result = await service.findBookingsWithPagination(options, context);

    expect(result).toEqual({ bookings: mockBookings, total: mockTotal });
    expect(createQueryBuilderMock.skip).toHaveBeenCalledWith(5); // (2 - 1) * 5
    expect(createQueryBuilderMock.take).toHaveBeenCalledWith(5);
  });

  it('should handle missing filters gracefully', async () => {
    (createQueryBuilderMock.getManyAndCount as jest.Mock).mockResolvedValue(
      mockReturn,
    );

    const options: BookingQueryOptions = {
      page: 1,
      limit: 10,
    };

    const context: BookingQueryContext = {
      userId: 789,
      isBusinessOwner: false,
      canViewAllBookings: false,
    };

    const result = await service.findBookingsWithPagination(options, context);

    expect(result).toEqual({ bookings: mockBookings, total: mockTotal });
    expect(createQueryBuilderMock.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining('booking.status'),
      expect.any(Object),
    );
    expect(createQueryBuilderMock.orderBy).toHaveBeenCalled();
  });
});
