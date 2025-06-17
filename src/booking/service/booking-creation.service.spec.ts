import { Test, TestingModule } from '@nestjs/testing';
import { BookingCreationService } from './booking-creation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { Repository } from 'typeorm';
import { SlotService } from 'src/slot/slot.service';
import { ServiceOfferingService } from 'src/service-offering/service-offering.service';
import { CreateBookingDto } from '../dto/create-booking.dto';

describe('BookingCreationService', () => {
  let service: BookingCreationService;
  let bookingRepo: Repository<Booking>;
  let slotService: SlotService;
  let serviceOfferingService: ServiceOfferingService;

  const mockBookingRepo = {
    manager: {
      connection: {
        createQueryRunner: jest.fn(),
      },
    },
    create: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
    },
  };

  const mockSlotService = {
    checkAvailabilityAndBook: jest.fn(),
  };

  const mockServiceOfferingService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingCreationService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepo,
        },
        {
          provide: SlotService,
          useValue: mockSlotService,
        },
        {
          provide: ServiceOfferingService,
          useValue: mockServiceOfferingService,
        },
      ],
    }).compile();

    service = module.get<BookingCreationService>(BookingCreationService);
    bookingRepo = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    slotService = module.get<SlotService>(SlotService);
    serviceOfferingService = module.get<ServiceOfferingService>(
      ServiceOfferingService,
    );

    mockBookingRepo.manager.connection.createQueryRunner.mockReturnValue(
      mockQueryRunner,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const dto: CreateBookingDto = {
    serviceOfferingId: 1,
    startDateTime: '2025-06-15T10:00:00.000Z',
    specialRequests: 'Please call before arrival',
    guestName: 'John Doe',
    guestEmail: 'john.doe@example.com',
    guestPhone: '+1234567890',
  };

  it('should create a booking successfully', async () => {
    const mockService = { durationMinutes: 30 };
    const mockSlot = { id: 123 };
    const mockSavedBooking = { id: 999 };

    mockServiceOfferingService.findById.mockResolvedValue(mockService);
    mockSlotService.checkAvailabilityAndBook.mockResolvedValue(mockSlot);
    mockBookingRepo.create.mockReturnValue(mockSavedBooking);
    mockQueryRunner.manager.save.mockResolvedValue(mockSavedBooking);

    const result = await service.createBookingWithTransaction(dto, 10);

    expect(mockQueryRunner.connect).toHaveBeenCalled();
    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(mockServiceOfferingService.findById).toHaveBeenCalledWith(1);
    expect(mockSlotService.checkAvailabilityAndBook).toHaveBeenCalledWith(
      dto.startDateTime,
      dto.serviceOfferingId,
      mockService.durationMinutes,
    );
    expect(mockBookingRepo.create).toHaveBeenCalledWith({
      userId: 10,
      serviceOfferingId: dto.serviceOfferingId,
      slotId: mockSlot.id,
      status: BookingStatus.CREATED,
      specialRequests: dto.specialRequests,
      guestName: dto.guestName,
      guestEmail: dto.guestEmail,
      guestPhone: dto.guestPhone,
    });
    expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(mockSavedBooking);
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
    expect(result).toEqual(mockSavedBooking);
  });

  it('should rollback and throw error if something fails', async () => {
    const error = new Error('Something went wrong');
    mockServiceOfferingService.findById.mockRejectedValue(error);

    await expect(service.createBookingWithTransaction(dto)).rejects.toThrow(
      'Something went wrong',
    );
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });
});
