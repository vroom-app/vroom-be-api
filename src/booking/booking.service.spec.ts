import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingService } from './booking.service';
import { Booking, BookingStatus } from './entities/booking.entity';
import { SlotService } from '../slot/slot.service';
import { ServiceOfferingService } from '../service-offering/service-offering.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { Logger } from '@nestjs/common';
import { BookingValidationException, BookingConflictException } from './exceptions/booking.exceptions';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('BookingService', () => {
    let service: BookingService;
    let bookingRepository: Repository<Booking>;
    let slotService: SlotService;
    let serviceOfferingService: ServiceOfferingService;

    const mockBookingRepository = {
        create: jest.fn(),
        save: jest.fn(),
        manager: {
        connection: {
            createQueryRunner: jest.fn(() => ({
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
            manager: {
                save: jest.fn(),
            },
            })),
        },
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
                BookingService,
                {
                    provide: getRepositoryToken(Booking),
                    useValue: mockBookingRepository,
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

        service = module.get<BookingService>(BookingService);
        bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
        slotService = module.get<SlotService>(SlotService);
        serviceOfferingService = module.get<ServiceOfferingService>(ServiceOfferingService);

        // Mock logger to avoid console output during tests
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        const validCreateDto: CreateBookingDto = {
            serviceOfferingId: 1,
            startDateTime: new Date(Date.now() + 86400000).toISOString(),
            specialRequests: 'Test request',
            guestName: 'Test User',
            guestEmail: 'test@example.com',
            guestPhone: '+1234567890',
        };

        const mockServiceDetails = {
            id: 1,
            durationMinutes: 60,
        };

        const mockSlot = {
            id: 1,
        };

        const mockSavedBooking = {
            id: 1,
            userId: null,
            serviceOfferingId: 1,
            slotId: 1,
            status: BookingStatus.CREATED,
            specialRequests: 'Test request',
            guestName: 'Test User',
            guestEmail: 'test@example.com',
            guestPhone: '+1234567890',
        };

        it('should successfully create a booking for a guest user', async () => {
            mockServiceOfferingService.findById.mockResolvedValue(mockServiceDetails);
            mockSlotService.checkAvailabilityAndBook.mockResolvedValue(mockSlot);

            const queryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    save: jest.fn().mockResolvedValue(mockSavedBooking),
                },
            };

            const createQueryRunnerMock = jest.fn(() => queryRunner);
            mockBookingRepository.manager.connection.createQueryRunner = createQueryRunnerMock;
            mockBookingRepository.create.mockReturnValue(mockSavedBooking);

            const result = await service.create(validCreateDto);

            expect(mockServiceOfferingService.findById).toHaveBeenCalledWith(validCreateDto.serviceOfferingId);
            expect(mockSlotService.checkAvailabilityAndBook).toHaveBeenCalledWith(
                validCreateDto.startDateTime,
                validCreateDto.serviceOfferingId,
                mockServiceDetails.durationMinutes,
            );
            expect(queryRunner.manager.save).toHaveBeenCalled();
            expect(queryRunner.commitTransaction).toHaveBeenCalled();
            expect(queryRunner.release).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({ id: mockSavedBooking.id }));
        });

        it('should successfully create a booking for a logged-in user', async () => {
            mockServiceOfferingService.findById.mockResolvedValue(mockServiceDetails);
            mockSlotService.checkAvailabilityAndBook.mockResolvedValue(mockSlot);

            const userId = 42;

            const bookingWithUser = { ...mockSavedBooking, userId };
            
            const queryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    save: jest.fn().mockResolvedValue(bookingWithUser),
                },
            };

            const createQueryRunnerMock = jest.fn(() => queryRunner);
            mockBookingRepository.manager.connection.createQueryRunner = createQueryRunnerMock;
            mockBookingRepository.create.mockReturnValue(bookingWithUser);

            const result = await service.create(validCreateDto, userId);

            expect(mockServiceOfferingService.findById).toHaveBeenCalledWith(validCreateDto.serviceOfferingId);
            expect(mockSlotService.checkAvailabilityAndBook).toHaveBeenCalledWith(
                validCreateDto.startDateTime,
                validCreateDto.serviceOfferingId,
                mockServiceDetails.durationMinutes,
            );
            expect(queryRunner.manager.save).toHaveBeenCalledWith(expect.objectContaining({ userId }));
            expect(queryRunner.commitTransaction).toHaveBeenCalled();
            expect(queryRunner.release).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({ id: bookingWithUser.id }));
        });

        it('should throw BadRequestException for invalid booking data ', async () => {
            const invalidDto = { ...validCreateDto, guestEmail: undefined };
            console.log('Invalid DTO:', invalidDto);
            await expect(service.create(invalidDto)).rejects.toThrow(BookingValidationException);
        });

        it('should throw BadRequestException for invalid booking time (past date)', async () => {
            const invalidTimeDto = {
                ...validCreateDto,
                startDateTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            };
            
            await expect(service.create(invalidTimeDto)).rejects.toThrow(BookingValidationException);
        });

        it('should throw ConflictException when slot is not available', async () => {
            mockServiceOfferingService.findById.mockResolvedValue(mockServiceDetails);
            mockSlotService.checkAvailabilityAndBook.mockRejectedValue(
                new BookingConflictException('Slot not available')
            );

            await expect(service.create(validCreateDto)).rejects.toThrow(ConflictException);
        });

        // it('should rollback transaction when error occurs during booking creation', async () => {
        //     mockServiceOfferingService.findById.mockResolvedValue(mockServiceDetails);
        //     mockSlotService.checkAvailabilityAndBook.mockResolvedValue(mockSlot);
            
        //     const queryRunner = bookingRepository.manager.connection.createQueryRunner();
        //     queryRunner.manager.save.mockRejectedValue(new Error('Database error'));

        //     await expect(service.create(validCreateDto)).rejects.toThrow(BadRequestException);
        //     expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
        //     expect(queryRunner.release).toHaveBeenCalled();
        // });

        it('should handle service not found error', async () => {
            mockServiceOfferingService.findById.mockRejectedValue(new Error('Service not found'));

            await expect(service.create(validCreateDto)).rejects.toThrow(BadRequestException);
        });

        it('should log errors appropriately', async () => {
            const error = new Error('Test error');
            mockServiceOfferingService.findById.mockRejectedValue(error);

            await expect(service.create(validCreateDto)).rejects.toThrow();
            expect(Logger.prototype.error).toHaveBeenCalledWith(
                `Failed to create booking: ${error.message}`,
                error.stack
            );
        });
    });
});