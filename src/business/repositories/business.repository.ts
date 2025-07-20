import { InjectRepository } from "@nestjs/typeorm";
import { Business } from "../entities/business.entity";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { assertAffected } from "src/common/utils/assertAffected";

@Injectable()
export class BusinessRepository {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

    /** 
     * Find all businesses owned by a specific user.
     * @param userId The ID of the user whose businesses to find
     * @return An array of businesses owned by the user
     */
    async findUserBusinesses(userId: number): Promise<Business[]> {
    return this.businessRepository.find({
      where: {
        ownerId: userId,
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['openingHours'],
    });
  }
    
    
  /**
   * Find a business by its ID, including its opening hours and service offerings.
   * @param id The ID of the business to find
   * @returns The business entity, or null if not found.
   */
  async findBusinessWithOpeningHoursAndServiceOfferingsById(businessId: string): Promise<Business | null> {
      return this.businessRepository.findOne({
          where: { 
            id: businessId 
          },
          relations: ['openingHours', 'serviceOfferings'],
      });
  }

  /**
   * Find a business by its ID.
   * @param businessId The ID of the business to find
   * @returns The business entity, or null if not found.
   */
  async findBusinessById(businessId: string): Promise<Business | null> {
      return await this.businessRepository.findOne({
          where: { 
            id: businessId 
          },
      });
  }

  /**
   * Remove a business from the repository.
   * @param businessId The ID of the business to remove
   * @throws NotFoundException if the business does not exist.
   * @returns True if the business was successfully deleted, otherwise throws NotFoundException.
   */
  async deleteBusiness(businessId: string): Promise<DeleteResult> {
    return await this.businessRepository.delete({
      id: businessId,
    });
  }

  /**
   * Create a new business in the repository.
   * @param businessData The data for the new business
   * @returns The created business entity.
   */
  async createBusiness(businessData: Partial<Business>): Promise<Business> {
    const business = this.businessRepository.create(businessData);
    return this.businessRepository.save(business);
  }

  /**
   * Update a business in the repository.
   * @param businessId The ID of the business to update
   * @param updateData The data to update the business with
   */
  async updateBusiness(businessId: string, updateData: Partial<Business>): Promise<UpdateResult> {
    return await this.businessRepository.update(businessId, updateData);
  }
}