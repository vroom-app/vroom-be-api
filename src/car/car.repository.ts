import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Car } from "./entities/car.entity";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { CreateCarDto } from "./dto/create-car.dto";
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
     * @param ownerId - The ID of the owner to check ownership.
     * @returns A promise that resolves to the found car entity or null if not found.
     * @throws NotFoundException if the car does not exist for the given owner.
     */
    async findUserCarById(id: string, ownerId: number): Promise<Car | null> {
        return await this.carRepository
            .createQueryBuilder('car')
            .innerJoin('car.users', 'user', 'user.id = :ownerId', { ownerId })
            .where('car.id = :id', { id })
            .getOne();
    }   

    /**
     * Finds all cars associated with a specific user.
     * @param userId - The ID of the user whose cars are to be retrieved.
     * @returns A promise that resolves to an array of car entities.
     */
    async findAllByUser(userId: number): Promise<Car[]> {
        return await this.carRepository
            .createQueryBuilder('car')
            .innerJoin('car.users', 'user', 'user.id = :userId', { userId })
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
}