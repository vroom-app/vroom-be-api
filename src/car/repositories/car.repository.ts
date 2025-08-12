import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Car } from "../entities/car.entity";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { assertEntityPresent } from "src/common/utils/assertEntity";

@Injectable()
export class CarRepository {
    constructor(@InjectRepository(Car) private readonly carRepository: Repository<Car>) {}

    /**
     * Creates a new car entity in the database.
     * @param dto - The data transfer object containing car details.
     * @returns A promise that resolves to the created car entity.
     */
    async create(dto: Partial<Car>): Promise<Car> {
        const car = this.carRepository.create(dto);
        return await this.carRepository.save(car);
    }

    /**
     * Finds a car entity by its ID and owner ID.
     * @param id - The ID of the car to be found.
     * @param userId - The ID of the owner to check ownership.
     * @returns A promise that resolves to the found car entity or null if not found.
     * @throws NotFoundException if the car does not exist for the given owner.
     */
    async findUserCarById(id: string, userId: number): Promise<Car | null> {
        return await this.carRepository
            .createQueryBuilder('car')
            .leftJoinAndSelect('car.users', 'users')
            .leftJoinAndSelect('car.reminders', 'reminders')
            .leftJoinAndSelect('car.serviceHistory', 'serviceHistory')
            .leftJoinAndSelect('car.tireHistory', 'tireHistory')
            .leftJoinAndSelect('car.expenseHistory', 'expenseHistory')
            .where('car.id = :id', { id })
            .andWhere('EXISTS (SELECT 1 FROM car_users cu WHERE cu.car_id = car.id AND cu.user_id = :userId)', { userId })
            .getOne();
    }

    /**
     * Finds all cars associated with a specific user.
     * @param userId - The ID of the user whose cars are to be retrieved.
     * @returns A promise that resolves to an array of car entities.
     */
    async findAllByUser(userId: number): Promise<Car[]> {
        return this.carRepository
            .createQueryBuilder('car')
            .innerJoin('car.users', 'user', 'user.id = :userId', { userId })
            .leftJoinAndSelect('car.users', 'users')
            .leftJoinAndSelect('car.reminders', 'reminders')
            .leftJoinAndSelect('car.serviceHistory', 'serviceHistory')
            .leftJoinAndSelect('car.tireHistory', 'tireHistory')
            .leftJoinAndSelect('car.expenseHistory', 'expenseHistory')
            .getMany();
    }

    /**
     * Deletes a car entity by its ID.
     * @param id - The ID of the car to be deleted.
     * @throws NotFoundException if the business does not exist.
     * @returns A promise that resolves when the deletion is complete.
     */
    async deleteByOwnerIdAndCarId(id: string, ownerId: number): Promise<DeleteResult> {
        assertEntityPresent(
            await this.findUserCarById(id, ownerId),
            `Car with ID ${id} not found for user ${ownerId}`
        );

        return this.carRepository.delete(id);
    }

    /**
     * Updates a car entity by its ID.
     * @param id - The ID of the car to be updated.
     * @param car - The partial car entity containing the updated fields.
     * @returns A promise that resolves to the update result.
     */
    async updateCar(id: string, car: Partial<Car>): Promise<UpdateResult> {
        return await this.carRepository.update(id, car);
    }

    async countByUserId(ownerId: number) {
        return await this.carRepository
            .createQueryBuilder('car')
            .innerJoin('car.users', 'user', 'user.id = :ownerId', { ownerId })
            .getCount();
    }
}