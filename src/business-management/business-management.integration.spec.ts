import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessManagementService } from './business-management.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BusinessService } from 'src/business/services/business.service';
import { ServiceOfferingService } from 'src/service-offering/service-offering.service';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Business } from 'src/business/entities/business.entity';
import { DurationUnit, PriceType, ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { BusinessOpeningHours } from 'src/business/entities/business-opening-hours.entity';
import { BusinessSpecialization } from 'src/business/entities/business-specialization.entity';
import { Specialization } from 'src/specialization/entities/specialization.entity';
import { CreateBusinessDto } from 'src/business/dtos/create-business.dto';
import { UpdateBusinessDetailsDto } from './dtos/business-details-update.dto';
import { CreateServiceOfferingDto } from 'src/service-offering/dtos/create-service-offering.dto';
import { UpdateBusinessServicesDto } from './dtos/business-offerings-update.dto';
import { Booking } from 'src/booking/entities/booking.entity';
import { Slot } from 'src/slot/entities/slot.entity';
import { Review } from 'src/review/entities/review.entity';
import { BusinessModule } from 'src/business/business.module';
import { ServiceOfferingModule } from 'src/service-offering/service-offering.module';
import { BusinessManagementModule } from './business-manager.module';

describe('BusinessManagementService Integration Tests', () => {
    let moduleRef: TestingModule;
    let businessManagementService: BusinessManagementService;
    let businessService: BusinessService;
    let serviceOfferingService: ServiceOfferingService;
    let userRepository: Repository<User>;
    let businessRepository: Repository<Business>;
    let serviceOfferingRepository: Repository<ServiceOffering>;
    let businessOwner: User;
    let regularUser: User;
    let testBusiness: Business;

    beforeAll(async () => {
        // Create test module with in-memory database
        moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: 'localhost',
                    port: 5433,
                    username: 'postgres',
                    password: 'postgres',
                    database: 'test_db',
                    entities: [
                        User, 
                        Business, 
                        ServiceOffering, 
                        BusinessOpeningHours, 
                        BusinessSpecialization,
                        Specialization,
                        Booking,
                        Slot,
                        Review
                    ],
                    synchronize: true,
                    dropSchema: true,
                }),
                BusinessModule,
                BusinessManagementModule,
                ServiceOfferingModule,
                TypeOrmModule.forFeature([
                    User, 
                    Business, 
                    ServiceOffering, 
                    BusinessOpeningHours, 
                    BusinessSpecialization,
                    Specialization,
                    Booking,
                    Slot,
                    Review
                ]),
            ],
            providers: [
                BusinessManagementService,
                BusinessService,
                ServiceOfferingService,
            ],
        }).compile();

        // Get services and repositories
        businessManagementService = moduleRef.get<BusinessManagementService>(BusinessManagementService);
        businessService = moduleRef.get<BusinessService>(BusinessService);
        serviceOfferingService = moduleRef.get<ServiceOfferingService>(ServiceOfferingService);
        userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
        businessRepository = moduleRef.get<Repository<Business>>(getRepositoryToken(Business));
        serviceOfferingRepository = moduleRef.get<Repository<ServiceOffering>>(getRepositoryToken(ServiceOffering));

        // Setup test data
        await setupTestData();
    });

    afterAll(async () => {
        await moduleRef.close();
    });

    async function setupTestData() {
        // Create business owner
        const ownerPasswordHash = await bcrypt.hash('password123', 10);
        businessOwner = userRepository.create({
            email: 'owner@test.com',
            firstName: 'Business',
            lastName: 'Owner',
            country: 'BG',
            phone: '1234567890',
            passwordHash: ownerPasswordHash,
            roles: [UserRole.BUSINESS_OWNER],
        });
        await userRepository.save(businessOwner);

        // Create regular user
        const userPasswordHash = await bcrypt.hash('password123', 10);
            regularUser = userRepository.create({
            email: 'user@test.com',
            firstName: 'Regular',
            lastName: 'User',
            country: 'BG',
            phone: '0987654321',
            passwordHash: userPasswordHash,
            roles: [UserRole.USER],
        });
        await userRepository.save(regularUser);
    }

    describe('Business Creation and Management', () => {
        it('should allow business owner to create a business', async () => {
            const createBusinessDto: CreateBusinessDto = {
                name: 'Test Business',
                description: 'Test business description',
                address: '123 Test Street',
                city: 'Test City',
                googleCategory: 'Test Category',
                googlePlaceId: 'test_place_id_123',
                latitude: 42.6977,
                longitude: 23.3219,
                phone: '+35987654321',
                openingHours: [
                {
                    dayOfWeek: 1,
                    opensAt: '09:00',
                    closesAt: '18:00',
                },
                {
                    dayOfWeek: 2,
                    opensAt: '09:00',
                    closesAt: '18:00',
                },
                ],
            };

            // Create business
            const createdBusiness = await businessManagementService.createBusiness(
                businessOwner.id,
                createBusinessDto,
            );

            // Save reference for later tests
            testBusiness = createdBusiness;

            // Verify created business
            expect(createdBusiness).toBeDefined();
            expect(createdBusiness.name).toBe(createBusinessDto.name);
            expect(createdBusiness.description).toBe(createBusinessDto.description);
            expect(createdBusiness.address).toBe(createBusinessDto.address);

            // Verify opening hours were created
            const businessFromDb = await businessRepository.findOne({
                where: { id: createdBusiness.id },
                relations: ['openingHours'],
            });
            expect(businessFromDb).not.toBeNull();
            expect(businessFromDb!.openingHours.length).toBe(2);
        });

        it('should retrieve business profile', async () => {
            // Get business profile
            const businessProfile = await businessManagementService.getBusinessProfile(
                testBusiness.id,
                businessOwner.id,
            );

            // Verify business profile
            expect(businessProfile).toBeDefined();
            expect(businessProfile.id).toBe(testBusiness.id);
            expect(businessProfile.name).toBe(testBusiness.name);
            expect(businessProfile.address).toBe(testBusiness.address);
        });

        it('should allow business owner to update business details', async () => {
            const updateDto: UpdateBusinessDetailsDto = {
                name: 'Updated Business Name',
                description: 'Updated business description',
                website: 'https://updated-business.com',
            };

            // Update business details
            const updatedBusiness = await businessManagementService.updateBusinessDetails(
                businessOwner.id,
                testBusiness.id,
                updateDto,
            );

            // Verify updated business
            expect(updatedBusiness).toBeDefined();
            expect(updatedBusiness.name).toBe(updateDto.name);
            expect(updatedBusiness.description).toBe(updateDto.description);
            expect(updatedBusiness.website).toBe(updateDto.website);
        });

        it('should not allow regular user to update business details', async () => {
            const updateDto: UpdateBusinessDetailsDto = {
                name: 'Unauthorized Update',
            };

            // Attempt to update business as regular user
            await expect(
                businessManagementService.updateBusinessDetails(
                    regularUser.id,
                    testBusiness.id,
                    updateDto,
                )
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('Service Offerings Management', () => {
        let serviceOfferings: ServiceOffering[];

        it('should allow business owner to add service offerings', async () => {
            const createServiceOfferingDto: CreateServiceOfferingDto[] = [
                {
                name: 'Service 1',
                description: 'First service description',
                price: 100,
                priceType: PriceType.FIXED,
                durationUnit: DurationUnit.MINUTES,
                durationMinutes: 60,
                },
                {
                name: 'Service 2',
                description: 'Second service description',
                price: 150,
                priceType: PriceType.FIXED,
                durationUnit: DurationUnit.MINUTES,
                durationMinutes: 120,
                },
            ];

            // Add service offerings
            serviceOfferings = await businessManagementService.addBusinessServiceOfferings(
                businessOwner.id,
                testBusiness.id,
                createServiceOfferingDto,
            );

            // Verify service offerings
            expect(serviceOfferings).toBeDefined();
            expect(serviceOfferings.length).toBe(2);
            expect(serviceOfferings[0].name).toBe(createServiceOfferingDto[0].name);
            expect(serviceOfferings[1].name).toBe(createServiceOfferingDto[1].name);
        });

        it('should not allow regular user to add service offerings', async () => {
            const createServiceOfferingDto: CreateServiceOfferingDto[] = [
                {
                name: 'Unauthorized Service',
                description: 'Unauthorized service description',
                price: 50,
                priceType: PriceType.FIXED,
                durationUnit: DurationUnit.MINUTES,
                durationMinutes: 30,
                },
            ];

            // Attempt to add service offerings as regular user
            await expect(
                businessManagementService.addBusinessServiceOfferings(
                regularUser.id,
                testBusiness.id,
                createServiceOfferingDto,
                )
            ).rejects.toThrow(ForbiddenException);
        });

        it('should allow business owner to update service offerings', async () => {
            const updateBusinessServicesDto: UpdateBusinessServicesDto = {
                services: [
                {
                    id: serviceOfferings[0].id,
                    name: 'Updated Service 1',
                    price: 120,
                },
                ],
            };

            // Update service offerings
            const updatedServices = await businessManagementService.updateBusinessServices(
                businessOwner.id,
                testBusiness.id,
                updateBusinessServicesDto,
            );

            // Verify updated service offerings
            expect(updatedServices).toBeDefined();
            expect(updatedServices.length).toBe(1);
            expect(updatedServices[0].name).toBe(updateBusinessServicesDto.services[0].name);
            expect(updatedServices[0].price).toBe(updateBusinessServicesDto.services[0].price);
        });

        it('should not allow regular user to update service offerings', async () => {
            const updateBusinessServicesDto: UpdateBusinessServicesDto = {
                services: [
                {
                    id: serviceOfferings[0].id,
                    name: 'Unauthorized Update',
                },
                ],
            };

            // Attempt to update service offerings as regular user
            await expect(
                businessManagementService.updateBusinessServices(
                regularUser.id,
                testBusiness.id,
                updateBusinessServicesDto,
                )
            ).rejects.toThrow(ForbiddenException);
        });

        it('should allow business owner to delete service offering', async () => {
            // Delete service offering
            const result = await businessManagementService.deleteServiceOffering(
                businessOwner.id,
                testBusiness.id,
                serviceOfferings[1].id,
            );

            // Verify deletion
            expect(result).toBe(true);

            // Verify service offering no longer exists
            const serviceOffering = await serviceOfferingRepository.findOne({
                where: { id: serviceOfferings[1].id },
            });
            expect(serviceOffering).toBeNull();
        });

        it('should not allow regular user to delete service offering', async () => {
            // Attempt to delete service offering as regular user
            await expect(
                businessManagementService.deleteServiceOffering(
                regularUser.id,
                testBusiness.id,
                serviceOfferings[0].id,
                )
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('Business Deletion', () => {
        it('should delete business and its services', async () => {
            // Delete business
            const result = await businessManagementService.deleteBusinessAndServices(
                testBusiness.id,
                businessOwner.id,
            );

            // Verify deletion
            expect(result).toBe(true);

            // Verify business no longer exists
            const business = await businessRepository.findOne({
                where: { id: testBusiness.id },
            });
            expect(business).toBeNull();

            // Verify service offerings are also deleted
            const serviceOfferings = await serviceOfferingRepository.find({
                where: { business: { id: testBusiness.id } },
            });
            expect(serviceOfferings.length).toBe(0);
        });
    });
});