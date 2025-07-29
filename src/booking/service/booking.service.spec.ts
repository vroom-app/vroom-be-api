import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { BookingQueryService } from './booking-query.service';
import { BookingDtoService } from './booking-dto.service';
import { BookingCreationService } from './booking-creation.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { QueryBookingDto } from '../dto/query-booking.dto';
import { Booking } from '../entities/booking.entity';
import { BusinessService } from 'src/business/services/business.service';
import { BookingResponseDto } from '../dto/booking-response.dto';
import {
  BookingConflictException,
  BookingValidationException,
} from '../exceptions/booking.exceptions';
import { BookingQueryOptions } from '../interfaces/booking-query-options.interface';
import { PaginatedBookingResponseDto } from '../dto/paginated-booking-response.dto';

jest.mock('../utils/booking.validator'); // If BookingValidator is static

describe('BookingService', () => {
  let service: BookingService;
  let bookingTransactionService: BookingCreationService;
  let bookingDtoService: BookingDtoService;
  let bookingQueryService: BookingQueryService;
  let businessService: BusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: BookingQueryService,
          useValue: {
            findBookingsWithPagination: jest.fn(),
          },
        },
        {
          provide: BookingDtoService,
          useValue: {
            mapQueryDtoToOptions: jest.fn(),
            createPaginatedResponse: jest.fn(),
          },
        },
        {
          provide: BookingCreationService,
          useValue: {
            createBookingWithTransaction: jest.fn(),
          },
        },
        {
          provide: BusinessService,
          useValue: {
            isOwnedByUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingTransactionService = module.get(BookingCreationService);
    bookingDtoService = module.get(BookingDtoService);
    bookingQueryService = module.get(BookingQueryService);
    businessService = module.get(BusinessService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    const createDto: CreateBookingDto = {
      startDateTime: new Date().toISOString(),
      serviceOfferingId: 1,
      guestName: 'John Doe',
      guestEmail: 'john@gmail.com',
      guestPhone: '+1234567890',
      businessId: 1,
      serviceId: 2,
    } as CreateBookingDto;

    it('should create a booking and return response DTO', async () => {
      const mockBooking = { id: 1 } as Booking;
      const mockResponse = { id: 1 } as BookingResponseDto;

      jest
        .spyOn(bookingTransactionService, 'createBookingWithTransaction')
        .mockResolvedValue(mockBooking);
      jest
        .spyOn(
          require('../utils/booking.mapper').BookingMapper,
          'toResponseDto',
        )
        .mockReturnValue(mockResponse);

      const result = await service.create(createDto, 5);

      expect(result).toEqual(mockResponse);
      expect(
        bookingTransactionService.createBookingWithTransaction,
      ).toHaveBeenCalledWith(createDto, 5);
    });

    it('should throw BadRequestException for BookingValidationException', async () => {
      jest
        .spyOn(bookingTransactionService, 'createBookingWithTransaction')
        .mockRejectedValue(new BookingValidationException('Invalid booking'));

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException for BookingConflictException', async () => {
      jest
        .spyOn(bookingTransactionService, 'createBookingWithTransaction')
        .mockRejectedValue(new BookingConflictException('Conflict'));

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for unknown error', async () => {
      jest
        .spyOn(bookingTransactionService, 'createBookingWithTransaction')
        .mockRejectedValue(new Error('Unknown'));

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findUserBookings()', () => {
    it('should fetch bookings for a user', async () => {
      const query: QueryBookingDto = { page: 1, limit: 5 };
      const options: BookingQueryOptions = { page: 1, limit: 5 };
      const mockResponse: PaginatedBookingResponseDto = {
        data: [],
        total: 0,
        page: 1,
        limit: 5,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      };

      jest
        .spyOn(bookingDtoService, 'mapQueryDtoToOptions')
        .mockReturnValue(options);
      jest
        .spyOn(bookingQueryService, 'findBookingsWithPagination')
        .mockResolvedValue({ bookings: [], total: 0 });
      jest
        .spyOn(bookingDtoService, 'createPaginatedResponse')
        .mockReturnValue(mockResponse);

      const result = await service.findUserBookings(query, 42);

      expect(result).toEqual(mockResponse);
      expect(bookingDtoService.mapQueryDtoToOptions).toHaveBeenCalledWith(
        query,
      );
    });
  });

  describe('findBusinessBookings()', () => {
    it('should fetch bookings for a business and verify ownership', async () => {
      const query: QueryBookingDto = { page: 1, limit: 10 };
      const options: BookingQueryOptions = { page: 1, limit: 10 };
      const mockResponse: PaginatedBookingResponseDto = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      };

      jest
        .spyOn(bookingDtoService, 'mapQueryDtoToOptions')
        .mockReturnValue(options);
      jest
        .spyOn(bookingQueryService, 'findBookingsWithPagination')
        .mockResolvedValue({ bookings: [], total: 0 });
      jest
        .spyOn(bookingDtoService, 'createPaginatedResponse')
        .mockReturnValue(mockResponse);

      const userId = 7;
      const businessId = '99';

      const result = await service.findBusinessBookings(
        query,
        businessId,
        userId,
      );

      expect(businessService.isOwnedByUser).toHaveBeenCalledWith(
        userId,
        businessId,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
