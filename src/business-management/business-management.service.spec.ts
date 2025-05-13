import { Test, TestingModule } from '@nestjs/testing';
import { BusinessManagementService } from './business-management.service';

import { ForbiddenException } from '@nestjs/common';
import { CreateBusinessDto } from 'src/business/dtos/create-business.dto';
import { CreateServiceOfferingDto } from 'src/service-offering/dtos/create-service-offering.dto';
import { DurationUnit, PriceType } from 'src/service-offering/entities/service-offering.entity';
import { UpdateBusinessDetailsDto } from './dtos/business-details-update.dto';
import { UpdateBusinessServicesDto } from './dtos/business-offerings-update.dto';
import { User } from 'src/users/entities/user.entity';
import { Point } from 'typeorm';
import { Slot } from 'src/slot/entities/slot.entity';
import { Business } from 'src/business/entities/business.entity';
import { BusinessService } from 'src/business/services/business.service';
import { ServiceOfferingService } from 'src/service-offering/service-offering.service';
import { BusinessOpeningHoursService } from 'src/business/services/business-opening-hours.service';

describe('BusinessManagementService', () => {
    let service: BusinessManagementService;
    let mockBusinessService: jest.Mocked<BusinessService>;
    let mockServiceOfferingService: jest.Mocked<ServiceOfferingService>;
    let mockBusinessOpeningHoursService: jest.Mocked<BusinessOpeningHoursService>;

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
                id: 1,
                name: 'Test Business',
                description: 'Test Description',
                address: '123 Test St',
                city: 'Test City',
                phone: '1234567890',
                website: 'https://testbusiness.com',
                isVerified: true,
                openingHours: [],
                specializations: [],
                services: [],
            };

            mockBusinessService.getBusinessProfile.mockResolvedValue(mockBusinessProfile);

            const result = await service.getBusinessProfile(1, 1);
            
            expect(mockBusinessService.getBusinessProfile).toHaveBeenCalledWith(1, 1);
            expect(result).toEqual(mockBusinessProfile);
        });
    });

    describe('createBusiness', () => {
        it('should create a new business', async () => {
            const userId = 1;
            const createBusinessDto: CreateBusinessDto = {
                name: 'New Business',
                address: '456 New St',
                description: 'New Description',
                googleCategory: 'carwash',
                city: 'New City',
                phone: '0987654321',
                googlePlaceId: 'google123',
                latitude: 40.7128,
                longitude: -74.0060,
            };

            const mockCreatedBusiness = {
                id: 2,
                ownerId: userId,
                owner: {} as User,
                coordinates: {} as Point,
                createdAt: new Date(),
                updatedAt: new Date(),
                openingHours: [] as any,
                specializations: [],
                serviceOfferings: [],
                slots: [],
                reviews: [],
                isVerified: false,
                additionalPhotos: null,
                website: null,
                ...createBusinessDto,
            };

            mockBusinessService.createBusiness.mockResolvedValue(mockCreatedBusiness);

            const result = await service.createBusiness(userId, createBusinessDto);
            
            expect(mockBusinessService.createBusiness).toHaveBeenCalledWith(userId, createBusinessDto);
            expect(result).toEqual(mockCreatedBusiness);
        });
    });

    describe('addBusinessServiceOfferings', () => {
        it('should add service offerings for a business owned by the user', async () => {
            const userId = 1;
            const businessId = 2;
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
                    businessId: 2,
                    business: {} as Business,
                    detailedDescription: 'Detailed description',
                    slots: [] as Slot[],
                    reviews: [],
                    bookings: [],
                    createdAt: new Date(),
                    includedServices: ['Service A', 'Service B'],
                    benefits: ['Benefit 1', 'Benefit 2'],
                    durationNote: null,
                    warranty: null,
                    category: null,
                    ...createServiceOfferingDto[0],
                },
            ];

            mockBusinessService.isOwnedByUser.mockResolvedValue(true);
            mockServiceOfferingService.createMultiple.mockResolvedValue(mockServiceOfferings);

            const result = await service.addBusinessServiceOfferings(userId, businessId, createServiceOfferingDto);
            
            expect(mockBusinessService.isOwnedByUser).toHaveBeenCalledWith(userId, businessId);
            expect(mockServiceOfferingService.createMultiple).toHaveBeenCalledWith(businessId, createServiceOfferingDto);
            expect(result).toEqual(mockServiceOfferings);
        });

        it('should throw ForbiddenException if user does not own the business', async () => {
            const userId = 1;
            const businessId = 2;
            const createServiceOfferingDto: CreateServiceOfferingDto[] = [];

            mockBusinessService.isOwnedByUser.mockResolvedValue(false);

            await expect(
                service.addBusinessServiceOfferings(userId, businessId, createServiceOfferingDto)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('updateBusinessDetails', () => {
        it('should update business details for a business owned by the user', async () => {
            const userId = 1;
            const businessId = 2;
            const updateBusinessDetailsDto: UpdateBusinessDetailsDto = {
                name: 'Updated Business Name',
                description: 'Updated description',
            };

            const mockUpdatedBusiness = {
                id: businessId,
                ownerId: userId,
                name: 'New Business',
                address: '456 New St',
                description: 'New Description',
                googleCategory: 'carwash',
                city: 'New City',
                phone: '0987654321',
                googlePlaceId: 'google123',
                latitude: 40.7128,
                longitude: -74.0060,
                owner: {} as User,
                coordinates: {} as Point,
                createdAt: new Date(),
                updatedAt: new Date(),
                openingHours: [] as any,
                specializations: [],
                serviceOfferings: [],
                slots: [],
                reviews: [],
                isVerified: false,
                additionalPhotos: null,
                website: null,
                ...updateBusinessDetailsDto,
            };

            mockBusinessService.isOwnedByUser.mockResolvedValue(true);
            mockBusinessService.updateBusiness.mockResolvedValue(mockUpdatedBusiness);

            const result = await service.updateBusinessDetails(userId, businessId, updateBusinessDetailsDto);
            
            expect(mockBusinessService.isOwnedByUser).toHaveBeenCalledWith(userId, businessId);
            expect(mockBusinessService.updateBusiness).toHaveBeenCalledWith(businessId, updateBusinessDetailsDto);
            expect(result).toEqual(mockUpdatedBusiness);
        });

        it('should throw ForbiddenException if user does not own the business', async () => {
            const userId = 1;
            const businessId = 2;
            const updateBusinessDetailsDto: UpdateBusinessDetailsDto = {
                name: 'Updated Business Name',
            };

            mockBusinessService.isOwnedByUser.mockResolvedValue(false);

            await expect(
                service.updateBusinessDetails(userId, businessId, updateBusinessDetailsDto)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('updateBusinessServices', () => {
        it('should update business services for a business owned by the user', async () => {
            const userId = 1;
            const businessId = 2;
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
                    businessId: 2,
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
                    durationNote: null,
                    warranty: null,
                    category: null,
                },
            ];

            mockBusinessService.isOwnedByUser.mockResolvedValue(true);
            mockServiceOfferingService.update.mockResolvedValue(mockUpdatedServices[0]);

            const result = await service.updateBusinessServices(userId, businessId, updateBusinessServicesDto);
            
            expect(mockBusinessService.isOwnedByUser).toHaveBeenCalledWith(userId, businessId);
            expect(mockServiceOfferingService.update).toHaveBeenCalledWith(1, updateBusinessServicesDto.services[0]);
            expect(result).toEqual(mockUpdatedServices);
        });

        it('should throw ForbiddenException if user does not own the business', async () => {
            const userId = 1;
            const businessId = 2;
            const updateBusinessServicesDto: UpdateBusinessServicesDto = {
                services: [],
        };

        mockBusinessService.isOwnedByUser.mockResolvedValue(false);

        await expect(
            service.updateBusinessServices(userId, businessId, updateBusinessServicesDto)
        ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('deleteServiceOffering', () => {
        it('should delete service offering for a business owned by the user', async () => {
            const userId = 1;
            const businessId = 2;
            const serviceOfferingId = 3;

            mockBusinessService.isOwnedByUser.mockResolvedValue(true);
            mockServiceOfferingService.deleteServiceOfferingByIdAndBusinessId.mockResolvedValue(true);

            const result = await service.deleteServiceOffering(userId, businessId, serviceOfferingId);
            
            expect(mockBusinessService.isOwnedByUser).toHaveBeenCalledWith(userId, businessId);
            expect(mockServiceOfferingService.deleteServiceOfferingByIdAndBusinessId).toHaveBeenCalledWith(serviceOfferingId, businessId);
            expect(result).toBe(true);
        });

        it('should throw ForbiddenException if user does not own the business', async () => {
            const userId = 1;
            const businessId = 2;
            const serviceOfferingId = 3;

            mockBusinessService.isOwnedByUser.mockResolvedValue(false);

            await expect(
                service.deleteServiceOffering(userId, businessId, serviceOfferingId)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('deleteBusinessAndServices', () => {
        it('should delete business and its services', async () => {
            const businessId = 1;
            const userId = 2;

            mockBusinessService.deleteBusinessByIdAndUserId.mockResolvedValue(true);

            const result = await service.deleteBusinessAndServices(businessId, userId);
            
            expect(mockBusinessService.deleteBusinessByIdAndUserId).toHaveBeenCalledWith(businessId, userId);
            expect(result).toBe(true);
        });
    });
});