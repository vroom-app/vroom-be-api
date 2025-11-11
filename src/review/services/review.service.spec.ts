// import { Test, TestingModule } from '@nestjs/testing';
// import { ReviewService } from './review.service';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { BusinessService } from 'src/business/services/business.service';
// import { ServiceOfferingService } from 'src/service-offering/services/service-offering.service';
// import { BadRequestException } from '@nestjs/common';
// import { Review } from '../entities/review.entity';

// const mockReviewRepository = () => ({
//   findOne: jest.fn(),
//   findAndCount: jest.fn(),
//   create: jest.fn(),
//   save: jest.fn(),
//   find: jest.fn(),
//   createQueryBuilder: jest.fn(() => ({
//     select: jest.fn().mockReturnThis(),
//     addSelect: jest.fn().mockReturnThis(),
//     where: jest.fn().mockReturnThis(),
//     andWhere: jest.fn().mockReturnThis(),
//     getRawOne: jest.fn().mockResolvedValue({
//       avgCommunication: '4.5',
//       avgQuality: '4.2',
//       avgPunctuality: '4.8',
//     }),
//   })),
// });

// const mockBusinessService = () => ({
//   findById: jest.fn(),
// });

// const mockServiceOfferingService = () => ({
//   findById: jest.fn(),
// });

// describe('createReview', () => {
//   let service: ReviewService;
//   let reviewRepo: ReturnType<typeof mockReviewRepository>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ReviewService,
//         {
//           provide: getRepositoryToken(Review),
//           useFactory: mockReviewRepository,
//         },
//         { provide: BusinessService, useFactory: mockBusinessService },
//         {
//           provide: ServiceOfferingService,
//           useFactory: mockServiceOfferingService,
//         },
//       ],
//     }).compile();

//     service = module.get<ReviewService>(ReviewService);
//     reviewRepo = module.get(getRepositoryToken(Review));
//   });

//   it('should create a review successfully (without serviceId)', async () => {
//     const dto = {
//       businessId: 'biz-123',
//       rating: 4,
//       comment: 'Good',
//       serviceId: undefined,
//     };
//     const userId = 1;

//     // (service['businessService'].findById as jest.Mock).mockResolvedValue({
//     //   id: 'biz-123',
//     //   name: 'Test Biz',
//     // });
//     reviewRepo.findOne.mockResolvedValue(null);
//     reviewRepo.create.mockReturnValue({ ...dto, userId });
//     reviewRepo.save.mockResolvedValue({ id: 1 });
//     jest
//       .spyOn(service as any, 'getReviewWithRelations')
//       .mockResolvedValue({ id: 1 } as any);

//     const result = await service.createReview(dto as any, userId);

//     expect(reviewRepo.create).toBeCalledWith({ ...dto, userId });
//     expect(result).toEqual({ id: 1 });
//   });

//   it('should throw BadRequestException if user already reviewed business', async () => {
//     const dto = { businessId: 'biz-123', rating: 5, comment: 'Repeat' };
//     // (service['businessService'].findById as jest.Mock).mockResolvedValue({});
//     reviewRepo.findOne.mockResolvedValue({ id: 99 });

//     await expect(service.createReview(dto as any, 1)).rejects.toThrow(
//       BadRequestException,
//     );
//   });

//   it('should call serviceOfferingService.findById if serviceId is provided', async () => {
//     const dto = {
//       businessId: 'biz-123',
//       rating: 5,
//       comment: 'Service Review',
//       serviceId: 42,
//     };
//     // (service['businessService'].findById as jest.Mock).mockResolvedValue({});
//     (service['serviceOfferingService'].findById as jest.Mock).mockResolvedValue(
//       {},
//     );
//     reviewRepo.findOne.mockResolvedValue(null);
//     reviewRepo.create.mockReturnValue({ ...dto, userId: 1 });
//     reviewRepo.save.mockResolvedValue({ id: 2 });
//     jest
//       .spyOn(service as any, 'getReviewWithRelations')
//       .mockResolvedValue({ id: 2 } as any);

//     await service.createReview(dto as any, 1);

//     expect(service['serviceOfferingService'].findById).toHaveBeenCalledWith(42);
//   });
// });

// describe('getBusinessReviews', () => {
//   it('should return paginated reviews for a business', async () => {
//     const review = {
//       id: 1,
//       businessId: 'biz-123',
//       userId: 1,
//       rating: 5,
//       comment: 'Great!',
//       createdAt: new Date(),
//       user: { id: 1, firstName: 'John', lastName: 'Doe' },
//       business: { id: 'biz-123', name: 'Biz' },
//       serviceOffering: null,
//     };

//     const service = await createService(); // same setup as above
//     // (service['businessService'].findById as jest.Mock).mockResolvedValue({});
//     service['reviewRepository'].findAndCount = jest
//       .fn()
//       .mockResolvedValue([[review], 1]);

//     const result = await service.getBusinessReviews('biz-123', {
//       page: 1,
//       limit: 10,
//     });

//     expect(result.reviews).toHaveLength(1);
//     expect(result.total).toBe(1);
//     expect(result.page).toBe(1);
//   });
// });

// describe('getBusinessAverageRating', () => {
//   it('should return average rating and total reviews', async () => {
//     const service = await createService();
//     const qbMock = {
//       select: jest.fn().mockReturnThis(),
//       addSelect: jest.fn().mockReturnThis(),
//       where: jest.fn().mockReturnThis(),
//       getRawOne: jest
//         .fn()
//         .mockResolvedValue({ averageRating: '4.25', totalReviews: '12' }),
//     };
//     service['reviewRepository'].createQueryBuilder = jest
//       .fn()
//       .mockReturnValue(qbMock);

//     const result = await service.getBusinessAverageRating('biz-1');

//     expect(result).toEqual({ averageRating: 4.25, totalReviews: 12 });
//   });

//   it('should return 0 values if no reviews exist', async () => {
//     const service = await createService();
//     const qbMock = {
//       select: jest.fn().mockReturnThis(),
//       addSelect: jest.fn().mockReturnThis(),
//       where: jest.fn().mockReturnThis(),
//       getRawOne: jest
//         .fn()
//         .mockResolvedValue({ averageRating: null, totalReviews: null }),
//     };
//     service['reviewRepository'].createQueryBuilder = jest
//       .fn()
//       .mockReturnValue(qbMock);

//     const result = await service.getBusinessAverageRating('biz-1');

//     expect(result).toEqual({ averageRating: 0, totalReviews: 0 });
//   });
// });

// async function createService(): Promise<ReviewService> {
//   const module: TestingModule = await Test.createTestingModule({
//     providers: [
//       ReviewService,
//       { provide: getRepositoryToken(Review), useFactory: mockReviewRepository },
//       { provide: BusinessService, useFactory: mockBusinessService },
//       {
//         provide: ServiceOfferingService,
//         useFactory: mockServiceOfferingService,
//       },
//     ],
//   }).compile();

//   return module.get<ReviewService>(ReviewService);
// }
