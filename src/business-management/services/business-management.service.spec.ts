import { BusinessService } from 'src/business/services/business.service';
import { BusinessManagementService } from './business-management.service';
import { BusinessOpeningHoursService } from 'src/business/services/business-opening-hours.service';
import { SearchClientService } from 'src/search-client/search-client.service';
import {
  Business,
  BusinessCategory,
} from 'src/business/entities/business.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { BusinessMapper } from 'src/common/utils/business-mapper.util';
import { BusinessOpeningHours } from 'src/business/entities/business-opening-hours.entity';

describe('BusinessManagementService', () => {
  let service: BusinessManagementService;
  let businessService: jest.Mocked<BusinessService>;
  let openingHoursService: jest.Mocked<BusinessOpeningHoursService>;
  let searchClient: jest.Mocked<SearchClientService>;

  const mockBusiness = {
    id: 'business-123',
    name: 'Mock Business',
    description: 'Mock description',
    categories: [BusinessCategory.CarDealer],
    specializations: ['GERMAN CARS'],
    email: 'test@example.com',
    website: 'https://mock.com',
    phone: '+359123456789',
    address: 'Test Address',
    city: 'Test City',
    latitude: 42.7,
    longitude: 23.3,
    isVerified: false,
    isSponsored: true,
    acceptBookings: true,
    nameEn: 'Mock Business EN',
    openingHours: [],
  } as unknown as Business;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessManagementService,
        {
          provide: BusinessService,
          useValue: {
            getBusinessDetails: jest.fn(),
            createBusiness: jest.fn(),
            updateBusiness: jest.fn(),
            findBusinessAndValidateOwnership: jest.fn(),
            deleteBusinessById: jest.fn(),
          },
        },
        {
          provide: BusinessOpeningHoursService,
          useValue: {
            createForBusiness: jest.fn(),
            updateForBusiness: jest.fn(),
          },
        },
        {
          provide: SearchClientService,
          useValue: {
            upsertBusiness: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BusinessManagementService>(BusinessManagementService);
    businessService = module.get(BusinessService);
    openingHoursService = module.get(BusinessOpeningHoursService);
    searchClient = module.get(SearchClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBusinessProfile', () => {
    it('should return business profile DTO', async () => {
      businessService.getBusinessDetails.mockResolvedValue(
        BusinessMapper.toBusinessProfileDto(mockBusiness),
      );

      const result = await service.getBusinessProfile('business-123');
      expect(result).toEqual(BusinessMapper.toBusinessProfileDto(mockBusiness));
      expect(businessService.getBusinessDetails).toHaveBeenCalledWith(
        'business-123',
      );
    });
  });

  describe('createBusiness', () => {
    it('should create business and sync with search engine', async () => {
      const dto = {
        name: 'New Biz',
        categories: [BusinessCategory.CarDealer],
        address: '123 Main St',
        city: 'Test City',
        latitude: 42.7,
        longitude: 23.3,
        openingHours: [{} as BusinessOpeningHours],
      };

      const savedBusiness = {
        ...mockBusiness,
        id: 'new-business-id',
        openingHours: [],
      };

      businessService.createBusiness.mockResolvedValue(savedBusiness);
      openingHoursService.createForBusiness.mockResolvedValue(dto.openingHours);
      searchClient.upsertBusiness.mockResolvedValue(undefined);

      const result = await service.createBusiness(1, dto as any);

      expect(businessService.createBusiness).toHaveBeenCalledWith(1, dto);
      expect(openingHoursService.createForBusiness).toHaveBeenCalledWith(
        'new-business-id',
        dto.openingHours,
      );
      expect(searchClient.upsertBusiness).toHaveBeenCalled();
      expect(result).toEqual(
        BusinessMapper.toBusinessProfileDto({
          ...savedBusiness,
          openingHours: dto.openingHours,
        }),
      );
    });
  });

  describe('updateBusinessDetails', () => {
    it('should update business and opening hours', async () => {
      const dto = {
        name: 'Updated Name',
        openingHours: [
          {
            dayOfWeek: 2,
            opensAt: '09:00',
            closesAt: '17:00',
          } as BusinessOpeningHours,
        ],
      };

      businessService.findBusinessAndValidateOwnership.mockResolvedValue(
        mockBusiness,
      );
      businessService.updateBusiness.mockResolvedValue(mockBusiness);
      openingHoursService.updateForBusiness.mockResolvedValue(dto.openingHours);
      searchClient.upsertBusiness.mockResolvedValue(undefined);

      const result = await service.updateBusinessDetails(
        1,
        'business-123',
        dto as any,
      );

      expect(businessService.updateBusiness).toHaveBeenCalled();
      expect(openingHoursService.updateForBusiness).toHaveBeenCalled();
      expect(result).toEqual(
        BusinessMapper.toBusinessProfileDto({
          ...mockBusiness,
          openingHours: dto.openingHours,
        }),
      );
    });
  });

  describe('updateBusinessOpeningHours', () => {
    it('should validate ownership and update hours', async () => {
      const openingHours = [
        { dayOfWeek: 1, opensAt: '10:00', closesAt: '19:00' },
      ];

      businessService.findBusinessAndValidateOwnership.mockResolvedValue(
        mockBusiness,
      );
      openingHoursService.updateForBusiness.mockResolvedValue(
        openingHours as any,
      );

      const result = await service.updateBusinessOpeningHours(
        1,
        'business-123',
        openingHours,
      );

      expect(result).toEqual(openingHours);
      expect(openingHoursService.updateForBusiness).toHaveBeenCalledWith(
        'business-123',
        openingHours,
      );
    });
  });

  describe('deleteBusinessAndServices', () => {
    it('should validate ownership and delete business', async () => {
      businessService.findBusinessAndValidateOwnership.mockResolvedValue(
        mockBusiness,
      );
      businessService.deleteBusinessById.mockResolvedValue(true);

      const result = await service.deleteBusinessAndServices('business-123', 1);

      expect(result).toBe(true);
      expect(businessService.deleteBusinessById).toHaveBeenCalledWith(
        'business-123',
      );
    });
  });
});
