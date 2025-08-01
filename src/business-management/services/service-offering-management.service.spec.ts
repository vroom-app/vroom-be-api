import { BusinessService } from 'src/business/services/business.service';
import { ServiceOfferingManagementService } from './service-offering-management.service';
import { ServiceOfferingService } from 'src/service-offering/services/service-offering.service';
import { ServiceOfferingDto } from 'src/service-offering/dto/service-offering.dto';
import { BusinessMapper } from '../mapper/business.mapper';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateServiceOfferingDto } from 'src/service-offering/dto/create-service-offering.dto';
import {
  ACTION_TYPE,
  ServiceOffering,
} from 'src/service-offering/entities/service-offering.entity';
import { Business } from 'src/business/entities/business.entity';
import { ServiceDescription } from 'src/service-offering/interfaces/service-description.interface';

describe('ServiceOfferingManagementService', () => {
  let service: ServiceOfferingManagementService;
  let businessService: jest.Mocked<BusinessService>;
  let serviceOfferingService: jest.Mocked<ServiceOfferingService>;

  const mockServiceOffering: ServiceOffering = Object.assign(
    new ServiceOffering(),
    {
      id: 1,
      businessId: 'business-123',
      name: 'Test Service',
      category: 'Cleaning',
      actionType: ACTION_TYPE.NONE,
      actionDetails: { type: ACTION_TYPE.NONE },
      description: {
        short: 'Basic cleaning',
        long: 'Thorough home or office cleaning service',
      },
      capacity: 1,
      createdAt: new Date(),
      slots: [],
      reviews: [],
      bookings: [],
    },
  );

  const serviceDto: ServiceOfferingDto =
    BusinessMapper.toServiceOfferingDto(mockServiceOffering);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOfferingManagementService,
        {
          provide: BusinessService,
          useValue: {
            findBusinessAndValidateOwnership: jest.fn(),
            findBusinessServiceAndValidateOwnership: jest.fn(),
          },
        },
        {
          provide: ServiceOfferingService,
          useValue: {
            createMultipleServices: jest.fn(),
            update: jest.fn(),
            deleteServiceById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ServiceOfferingManagementService);
    businessService = module.get(BusinessService);
    serviceOfferingService = module.get(ServiceOfferingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createServiceOfferingsForBusiness', () => {
    it('should validate business ownership and create service offerings', async () => {
      const userId = 1;
      const businessId = 'business-123';
      const dto: CreateServiceOfferingDto[] = [
        {
          name: 'Cleaning',
          category: 'category',
          actionType: ACTION_TYPE.NONE,
          actionDetails: { type: ACTION_TYPE.NONE },
        },
      ];

      serviceOfferingService.createMultipleServices.mockResolvedValue([
        mockServiceOffering,
      ]);

      const result = await service.createServiceOfferingsForBusiness(
        userId,
        businessId,
        dto,
      );

      expect(
        businessService.findBusinessAndValidateOwnership,
      ).toHaveBeenCalledWith(businessId, userId);
      expect(
        serviceOfferingService.createMultipleServices,
      ).toHaveBeenCalledWith(businessId, dto);
      expect(result).toEqual([serviceDto]);
    });
  });

  describe('updateBusinessService', () => {
    it('should validate ownership and update the service', async () => {
      const userId = 1;
      const businessId = 'business-123';
      const serviceId = 2;
      const updateData = { name: 'Updated Service' };

      serviceOfferingService.update.mockResolvedValue(mockServiceOffering);

      const result = await service.updateBusinessService(
        userId,
        businessId,
        serviceId,
        updateData,
      );

      expect(
        businessService.findBusinessServiceAndValidateOwnership,
      ).toHaveBeenCalledWith(businessId, serviceId, userId);
      expect(serviceOfferingService.update).toHaveBeenCalledWith(
        serviceId,
        updateData,
      );
      expect(result).toEqual(serviceDto);
    });
  });

  describe('deleteServiceOffering', () => {
    it('should validate ownership and delete the service offering', async () => {
      const userId = 1;
      const businessId = 'business-123';
      const serviceId = 3;

      serviceOfferingService.deleteServiceById.mockResolvedValue(true);

      const result = await service.deleteServiceOffering(
        userId,
        businessId,
        serviceId,
      );

      expect(
        businessService.findBusinessServiceAndValidateOwnership,
      ).toHaveBeenCalledWith(businessId, serviceId, userId);
      expect(serviceOfferingService.deleteServiceById).toHaveBeenCalledWith(
        serviceId,
      );
      expect(result).toBe(true);
    });
  });
  describe('ServiceOffering Entity', () => {
    it('should throw if actionDetails.type and actionType mismatch', () => {
      const entity = new ServiceOffering();
      entity.actionType = ACTION_TYPE.BOOKING_SYSTEM;
      entity.actionDetails = { type: ACTION_TYPE.NONE } as any;

      expect(() => entity.validateActionDetails()).toThrowError(
        /does not match actionType/,
      );
    });

    it('should pass if actionDetails.type and actionType match', () => {
      const entity = new ServiceOffering();
      entity.actionType = ACTION_TYPE.NONE;
      entity.actionDetails = { type: ACTION_TYPE.NONE } as any;

      expect(() => entity.validateActionDetails()).not.toThrow();
    });
  });
});
