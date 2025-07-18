import { Test, TestingModule } from '@nestjs/testing';
import { BusinessManagementService } from './business-management.service';

import { ForbiddenException } from '@nestjs/common';
import { CreateServiceOfferingDto } from 'src/service-offering/dto/create-service-offering.dto';
import {
  DurationUnit,
  PriceType,
} from 'src/service-offering/entities/service-offering.entity';
import { User } from 'src/users/entities/user.entity';
import { Point } from 'typeorm';
import { Slot } from 'src/slot/entities/slot.entity';
import { Business } from 'src/business/entities/business.entity';
import { BusinessService } from 'src/business/services/business.service';
import { ServiceOfferingService } from 'src/service-offering/service-offering.service';
import { BusinessOpeningHoursService } from 'src/business/services/business-opening-hours.service';
import { CreateBusinessDto, UpdateBusinessDto } from 'src/business/dto/business.dto';
import { SearchClientService } from 'src/search-client/search-client.service';
import { UpdateBusinessServicesDto } from '../dto/business-offerings-update.dto';

describe('BusinessManagementService', () => {
  let service: BusinessManagementService;
  let mockBusinessService: jest.Mocked<BusinessService>;
  let mockServiceOfferingService: jest.Mocked<ServiceOfferingService>;
  let mockBusinessOpeningHoursService: jest.Mocked<BusinessOpeningHoursService>;
  let SearchClientService: jest.Mocked<SearchClientService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessManagementService,
        {
          provide: BusinessService,
          useValue: {
            getBusinessProfile: jest.fn(),
            createBusiness: jest.fn(),
            isOwnedByUser: jest.fn(),
            updateBusiness: jest.fn(),
            deleteBusinessByIdAndUserId: jest.fn(),
          },
        },
        {
          provide: ServiceOfferingService,
          useValue: {
            createMultiple: jest.fn(),
            update: jest.fn(),
            deleteServiceOfferingByIdAndBusinessId: jest.fn(),
          },
        },
        {
          provide: BusinessOpeningHoursService,
          useValue: {
            createForBusiness: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BusinessManagementService>(BusinessManagementService);
    mockBusinessService = module.get(BusinessService);
    mockServiceOfferingService = module.get(ServiceOfferingService);
    mockBusinessOpeningHoursService = module.get(BusinessOpeningHoursService);
  });

  describe('getBusinessProfile', () => {
    it('should retrieve business profile for a given business and user', async () => {
      const mockBusinessProfile = {
        id: '1',
        name: 'Test Business',
        description: 'Test Description',
        address: '123 Test St',
        isVerified: true,
        isSponsored: false,
        acceptBookings: true,
        additionalPhotos: [],
        categories: [],
        specializations: [],
        contact: {
          email: "",
          phone: '1234567890',
          website: 'https://testbusiness.com',
        },
        media: {
          heroPicture: 'https://testbusiness.com/hero.jpg',
          mapLogo: 'https://testbusiness.com/map-logo.jpg',
          logo: 'https://testbusiness.com/logo.jpg',
          photoRefs: [],
        },
        socialLinks: {
          facebook: 'https://facebook.com/testbusiness',
          instagram: 'https://instagram.com/testbusiness',
          youtube: 'https://youtube.com/testbusiness',
          linkedin: 'https://linkedin.com/company/testbusiness',
          tiktok: 'https://tiktok.com/@testbusiness',
        },
        location: {
          address: '123 Test St',
          city: 'Test City',
          latitude: 40.7128,
          longitude: -74.006,
        },
        openingHours: [],
      };

      mockBusinessService.getBusinessProfile.mockResolvedValue(
        mockBusinessProfile,
      );

      const result = await service.getBusinessProfile('1', 1);

      expect(mockBusinessService.getBusinessProfile).toHaveBeenCalledWith(1, 1);
      expect(result.id).toEqual(mockBusinessProfile.id);
    });
  });

  describe('createBusiness', () => {
    it('should create a new business', async () => {
      const userId = 1;
      const createBusinessDto: CreateBusinessDto = {
        name: 'New Business',
        address: '456 New St',
        description: 'New Description',
        city: 'New City',
        phone: '0987654321',
        categories: [],
        latitude: 40.7128,
        longitude: -74.006,
      };

      const mockCreatedBusiness = {
        id: '2',
        ownerId: userId,
        owner: {} as User,
        createdAt: new Date(),
        updatedAt: new Date(),
        openingHours: [] as any,
        specializations: [],
        serviceOfferings: [],
        slots: [],
        reviews: [],
        website: 'https://newbusiness.com',
        isVerified: false,
        isSponsored: false,
        acceptBookings: true,
        additionalPhotos: [],
        ...createBusinessDto,
      };

      mockBusinessService.createBusiness.mockResolvedValue(mockCreatedBusiness);

      const result = await service.createBusiness(userId, createBusinessDto);

      expect(mockBusinessService.createBusiness).toHaveBeenCalledWith(
        userId,
        createBusinessDto,
      );
      expect(result.name).toEqual(mockCreatedBusiness.name);
    });
  });

  describe('addBusinessServiceOfferings', () => {
    it('should add service offerings for a business owned by the user', async () => {
      const userId = 1;
      const businessId = '2';
      const createServiceOfferingDto: CreateServiceOfferingDto[] = [
        {
          name: 'Service 1',
          description: 'First service',
          price: 100,
          priceType: PriceType.FIXED,
          durationMinutes: 60,
          durationUnit: DurationUnit.MINUTES,
          includedServices: ['Service A', 'Service B'],
          benefits: ['Benefit 1', 'Benefit 2'],
        },
      ];

      const mockServiceOfferings = [
        {
          id: 1,
          businessId: '2',
          business: {} as Business,
          detailedDescription: 'Detailed description',
          slots: [] as Slot[],
          reviews: [],
          bookings: [],
          createdAt: new Date(),
          includedServices: ['Service A', 'Service B'],
          benefits: ['Benefit 1', 'Benefit 2'],
          warranty: 'No warranty',
          durationNote: 'Duration in minutes',
          category: 'General',
          capacity: 2,
          ...createServiceOfferingDto[0],
        },
      ];

      mockBusinessService.isOwnedByUser.mockResolvedValue(true);
      mockServiceOfferingService.createMultiple.mockResolvedValue(
        mockServiceOfferings,
      );

      const result = await service.addBusinessServiceOfferings(
        userId,
        businessId,
        createServiceOfferingDto,
      );

      expect(mockBusinessService.isOwnedByUser).toHaveBeenCalledWith(
        userId,
        businessId,
      );
      expect(mockServiceOfferingService.createMultiple).toHaveBeenCalledWith(
        businessId,
        createServiceOfferingDto,
      );
      expect(result[0].id).toEqual(mockServiceOfferings[0].id);
    });

    it('should throw ForbiddenException if user does not own the business', async () => {
      const userId = 1;
      const businessId = '2';
      const createServiceOfferingDto: CreateServiceOfferingDto[] = [];

      mockBusinessService.isOwnedByUser.mockResolvedValue(false);

      await expect(
        service.addBusinessServiceOfferings(
          userId,
          businessId,
          createServiceOfferingDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateBusinessDetails', () => {
    it('should update business details for a business owned by the user', async () => {
      const userId = 1;
      const businessId = '2';
      const updateBusinessDetailsDto: UpdateBusinessDto = {
        name: 'Updated Business Name',
        description: 'Updated description',
      };

      const mockUpdatedBusiness = {
        id: businessId,
        ownerId: userId,
        name: 'New Business',
        address: '456 New St',
        description: 'New Description',
        city: 'New City',
        phone: '0987654321',
        googlePlaceId: 'google123',
        latitude: 40.7128,
        longitude: -74.006,
        owner: {} as User,
        coordinates: {} as Point,
        createdAt: new Date(),
        updatedAt: new Date(),
        openingHours: [] as any,
        specializations: [],
        serviceOfferings: [],
        slots: [],
        reviews: [],
        website: 'https://newbusiness.com',
        categories: [],
        isVerified: false,
        isSponsored: false,
        acceptBookings: true,
        additionalPhotos: [],
        ...updateBusinessDetailsDto,
      };

      mockBusinessService.isOwnedByUser.mockResolvedValue(true);
      mockBusinessService.updateBusiness.mockResolvedValue(mockUpdatedBusiness);

      const result = await service.updateBusinessDetails(
        userId,
        businessId,
        updateBusinessDetailsDto,
      );

      expect(mockBusinessService.isOwnedByUser).toHaveBeenCalledWith(
        userId,
        businessId,
      );
      expect(mockBusinessService.updateBusiness).toHaveBeenCalledWith(
        businessId,
        updateBusinessDetailsDto,
      );
      expect(result.id).toEqual(mockUpdatedBusiness.id);
    });

    it('should throw ForbiddenException if user does not own the business', async () => {
      const userId = 1;
      const businessId = '2';
      const updateBusinessDetailsDto: UpdateBusinessDto = {
        name: 'Updated Business Name',
      };

      mockBusinessService.isOwnedByUser.mockResolvedValue(false);

      await expect(
        service.updateBusinessDetails(
          userId,
          businessId,
          updateBusinessDetailsDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateBusinessServices', () => {
    it('should update business services for a business owned by the user', async () => {
      const userId = 1;
      const businessId = '2';
      const updateBusinessServicesDto: UpdateBusinessServicesDto = {
        services: [
          {
            id: 1,
            name: 'Updated Service',
            price: 150,
          },
        ],
      };

      const mockUpdatedServices = [
        {
          id: 1,
          businessId: '2',
          name: 'Updated Service',
          price: 150,
          description: 'First service',
          priceType: PriceType.FIXED,
          durationMinutes: 60,
          durationUnit: DurationUnit.MINUTES,
          includedServices: ['Service A', 'Service B'],
          benefits: ['Benefit 1', 'Benefit 2'],
          business: {} as Business,
          detailedDescription: 'Detailed description',
          slots: [] as Slot[],
          reviews: [],
          bookings: [],
          createdAt: new Date(),
          durationNote: 'Duration in minutes',
          warranty: 'No warranty',
          category: 'General',
          capacity: 2,
        },
      ];

      mockBusinessService.isOwnedByUser.mockResolvedValue(true);
      mockServiceOfferingService.update.mockResolvedValue(
        mockUpdatedServices[0],
      );

      const result = await service.updateBusinessServices(
        userId,
        businessId,
        updateBusinessServicesDto,
      );

      expect(mockBusinessService.isOwnedByUser).toHaveBeenCalledWith(
        userId,
        businessId,
      );
      expect(mockServiceOfferingService.update).toHaveBeenCalledWith(
        1,
        updateBusinessServicesDto.services[0],
      );
      expect(result[0].id).toEqual(mockUpdatedServices[0].id);
    });

    it('should throw ForbiddenException if user does not own the business', async () => {
      const userId = 1;
      const businessId = '2';
      const updateBusinessServicesDto: UpdateBusinessServicesDto = {
        services: [],
      };

      mockBusinessService.isOwnedByUser.mockImplementation(() => {
        throw new ForbiddenException();
      });

      await expect(
        service.updateBusinessServices(
          userId,
          businessId,
          updateBusinessServicesDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteServiceOffering', () => {
    it('should delete service offering for a business owned by the user', async () => {
      const userId = 1;
      const businessId = '2';
      const serviceOfferingId = 3;

      mockBusinessService.isOwnedByUser.mockResolvedValue(true);
      mockServiceOfferingService.deleteServiceOfferingByIdAndBusinessId.mockResolvedValue(
        true,
      );

      const result = await service.deleteServiceOffering(
        userId,
        businessId,
        serviceOfferingId,
      );

      expect(mockBusinessService.isOwnedByUser).toHaveBeenCalledWith(
        userId,
        businessId,
      );
      expect(
        mockServiceOfferingService.deleteServiceOfferingByIdAndBusinessId,
      ).toHaveBeenCalledWith(serviceOfferingId, businessId);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user does not own the business', async () => {
      const userId = 1;
      const businessId = '2';
      const serviceOfferingId = 3;

      mockBusinessService.isOwnedByUser.mockImplementation(() => {
        throw new ForbiddenException();
      });

      await expect(
        service.deleteServiceOffering(userId, businessId, serviceOfferingId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteBusinessAndServices', () => {
    it('should delete business and its services', async () => {
      const businessId = '1';
      const userId = 2;

      mockBusinessService.deleteBusinessByIdAndUserId.mockResolvedValue(true);

      const result = await service.deleteBusinessAndServices(
        businessId,
        userId,
      );

      expect(
        mockBusinessService.deleteBusinessByIdAndUserId,
      ).toHaveBeenCalledWith(businessId, userId);
      expect(result).toBe(true);
    });
  });
});
