import { Test, TestingModule } from '@nestjs/testing';
import { SlotService } from './slot.service';
import { ServiceOfferingService } from '../service-offering/service-offering.service';
import { BusinessOpeningHoursService } from '../business/services/business-opening-hours.service';
import { Slot } from './entities/slot.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOffering } from '../service-offering/entities/service-offering.entity';
import { BusinessOpeningHours } from '../business/entities/business-opening-hours.entity';
import { AvailableSlotsResponse } from './dtos/available-slots.dto';

describe('SlotService', () => {
    let service: SlotService;
    let slotRepo: jest.Mocked<Repository<Slot>>;
    let serviceOfferingService: jest.Mocked<ServiceOfferingService>;
    let openingHoursService: jest.Mocked<BusinessOpeningHoursService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SlotService,
                {
                    provide: getRepositoryToken(Slot),
                    useValue: {
                        find: jest.fn(),
                    },
                },
                {
                    provide: ServiceOfferingService,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: BusinessOpeningHoursService,
                    useValue: {
                        findBusinessWorktimeForWeekday: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<SlotService>(SlotService);
        slotRepo = module.get(getRepositoryToken(Slot));
        serviceOfferingService = module.get(ServiceOfferingService);
        openingHoursService = module.get(BusinessOpeningHoursService);
    });

    it('should return available slots for given days', async () => {
        serviceOfferingService.findById.mockResolvedValue({
            durationMinutes: 30,
        } as ServiceOffering);

        openingHoursService.findBusinessWorktimeForWeekday.mockResolvedValue({
            opensAt: '09:00',
            closesAt: '17:00',
        } as BusinessOpeningHours);

        slotRepo.find.mockResolvedValue([]);

        const result = await service.getAvailableSlots(1, 1, '2025-06-09', 1);

        expect(result).toHaveLength(1);
        expect(result[0].available_slots.length).toBeGreaterThan(0);
        expect(result[0].available_slots[0]).toHaveProperty('start_time');
        expect(result[0].available_slots[0]).toHaveProperty('end_time');
    });

    it('should return empty slots if business is closed on that day', async () => {
        serviceOfferingService.findById.mockResolvedValue({
            durationMinutes: 30,
        } as ServiceOffering);

        openingHoursService.findBusinessWorktimeForWeekday.mockResolvedValue(null);

        const result: AvailableSlotsResponse[] = await service.getAvailableSlots(1, 1, '2025-06-09', 1);
        console.log(result);
        expect(result).toHaveLength(0);
    });

    // should return slots only for the days when there business is open
    it('should return slots only for the days when business is open', async () => {
        serviceOfferingService.findById.mockResolvedValue({
            durationMinutes: 30,
        } as ServiceOffering);

        openingHoursService.findBusinessWorktimeForWeekday
            .mockResolvedValueOnce({ opensAt: '09:00', closesAt: '17:00' } as BusinessOpeningHours)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ opensAt: '09:00', closesAt: '17:00' } as BusinessOpeningHours)
            .mockResolvedValueOnce({ opensAt: '09:00', closesAt: '17:00' } as BusinessOpeningHours);

        slotRepo.find.mockResolvedValue([]);

        const result = await service.getAvailableSlots(1, 1, '2025-06-09', 5);

        expect(result).toHaveLength(3);
        expect(result[0].available_slots.length).toBeGreaterThan(0);
        expect(result[1].available_slots.length).toBeGreaterThan(0);
        expect(result[2].available_slots.length).toBeGreaterThan(0);
    });

    it('should return no slots if service duration is longer than business hours', async () => {
        serviceOfferingService.findById.mockResolvedValue({
            durationMinutes: 600,
        } as ServiceOffering);

        openingHoursService.findBusinessWorktimeForWeekday.mockResolvedValue({
            opensAt: '09:00',
            closesAt: '17:00',
        } as BusinessOpeningHours);

        const result = await service.getAvailableSlots(1, 1, '2025-06-09', 1);

        expect(result).toHaveLength(0);
    });

    it('should return slots for multiple days if daysCount > 1', async () => {
        serviceOfferingService.findById.mockResolvedValue({
            durationMinutes: 60,
        } as ServiceOffering);

        openingHoursService.findBusinessWorktimeForWeekday.mockResolvedValue({
            opensAt: '09:00',
            closesAt: '11:00',
        } as BusinessOpeningHours);

        slotRepo.find.mockResolvedValue([]);

        const result = await service.getAvailableSlots(1, 1, '2025-06-09', 2);

        expect(result).toHaveLength(2);
        expect(result[0].available_slots).toHaveLength(2);
        expect(result[1].available_slots).toHaveLength(2);
    });
});