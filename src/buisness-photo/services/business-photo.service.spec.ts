import { BusinessService } from "src/business/services/business.service";
import { BusinessPhotoService } from "./business-photo.service";
import { S3Service } from "src/s3/services/s3.service";
import { FileUpload } from "../interfaces/business-photo.interface";
import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { User } from "src/users/entities/user.entity";
import { Business, BusinessCategory } from "src/business/entities/business.entity";

describe('BusinessPhotoService', () => {
  let service: BusinessPhotoService;
  let businessService: jest.Mocked<BusinessService>;
  let s3Service: jest.Mocked<S3Service>;
  let logger: jest.Mocked<Logger>;

  const mockFiles: FileUpload[] = [
    { buffer: Buffer.from('file1'), originalName: 'photo1.jpg' },
    { buffer: Buffer.from('file2'), originalName: 'photo2.png' },
  ];

  const baseBusiness: Business = {
    id: 'business-123',
    name: 'Test Business',
    description: 'Test Description',
    categories: [BusinessCategory.CarDealer],
    specializations: ['Italian'],
    email: 'test@business.com',
    website: 'https://test.com',
    phone: '+1234567890',
    address: '123 Test St',
    city: 'Test City',
    latitude: 40.7128,
    longitude: -74.006,
    facebook: 'facebook.com/test',
    instagram: 'instagram.com/test',
    youtube: 'youtube.com/test',
    linkedin: 'linkedin.com/test',
    tiktok: 'tiktok.com/test',
    isVerified: false,
    isSponsored: false,
    acceptBookings: false,
    ownerId: 1,
    logoUrl: undefined,
    logoMapUrl: undefined,
    photoUrl: undefined,
    additionalPhotos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: {} as User,
    openingHours: [],
    serviceOfferings: [],
    slots: [],
    reviews: [],
  };

  const businessId = 'business-id';
  const userId = 123;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessPhotoService,
        {
          provide: BusinessService,
          useValue: {
            findBusinessAndValidateOwnership: jest.fn(),
            updateBusinessPhotos: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(BusinessPhotoService);
    businessService = module.get(BusinessService) as jest.Mocked<BusinessService>;
    s3Service = module.get(S3Service) as jest.Mocked<S3Service>;

    logger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    (service as any).logger = logger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadPictures', () => {
    it('should set first image as main photo if no existing photoUrl', async () => {
      s3Service.uploadFile
        .mockResolvedValueOnce('url1')
        .mockResolvedValueOnce('url2');

      businessService.findBusinessAndValidateOwnership.mockResolvedValue({
        ...baseBusiness,
        photoUrl: undefined,
        additionalPhotos: [],
      });

      businessService.updateBusinessPhotos.mockResolvedValue({} as Business);

      const result = await service.uploadPictures(businessId, userId, mockFiles);

      expect(s3Service.uploadFile).toHaveBeenCalledTimes(2);
      expect(businessService.findBusinessAndValidateOwnership).toHaveBeenCalledWith(
        businessId,
        userId,
      );
      expect(businessService.updateBusinessPhotos).toHaveBeenCalledWith(
        businessId,
        {
          photoUrl: 'url1',
          additionalPhotos: ['url2'],
        },
      );

      expect(result).toEqual({
        photoUrl: 'url1',
        additionalPhotos: ['url2'],
      });
    });

    it('should append all uploaded images as additionalPhotos if photoUrl already exists', async () => {
      s3Service.uploadFile
        .mockResolvedValueOnce('url1')
        .mockResolvedValueOnce('url2');

      businessService.findBusinessAndValidateOwnership.mockResolvedValue({
        ...baseBusiness,
        photoUrl: 'existing-url',
        additionalPhotos: ['existing1'],
      });

      businessService.updateBusinessPhotos.mockResolvedValue({} as Business);

      const result = await service.uploadPictures(businessId, userId, mockFiles);

      expect(businessService.updateBusinessPhotos).toHaveBeenCalledWith(
        businessId,
        {
          photoUrl: 'existing-url',
          additionalPhotos: ['existing1', 'url1', 'url2'],
        },
      );

      expect(result).toEqual({
        photoUrl: 'existing-url',
        additionalPhotos: ['existing1', 'url1', 'url2'],
      });
    });

    it('should handle case when no files are uploaded', async () => {
      businessService.findBusinessAndValidateOwnership.mockResolvedValue({
        ...baseBusiness,
        photoUrl: undefined,
        additionalPhotos: [],
      });

      await expect(service.uploadPictures(businessId, userId, [])).rejects.toThrow(
            new Error('At least one picture file is required')
            );

      expect(s3Service.uploadFile).not.toHaveBeenCalled();
      expect(businessService.updateBusinessPhotos).not.toHaveBeenCalled();
    });

    it('should log upload count and businessId', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      s3Service.uploadFile.mockResolvedValueOnce('url1');

      businessService.findBusinessAndValidateOwnership.mockResolvedValue({
        ...baseBusiness,
        photoUrl: undefined,
        additionalPhotos: [],
      });

      await service.uploadPictures(businessId, userId, [mockFiles[0]]);

      expect(logSpy).toHaveBeenCalledWith(
        '1 pictures uploaded for business business-id',
      );
    });
  });
});