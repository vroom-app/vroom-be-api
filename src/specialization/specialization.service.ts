import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Specialization } from "./entities/specialization.entity";
import { Repository } from "typeorm";

@Injectable()
export class SpecializationService {
    constructor(
        @InjectRepository(Specialization)
        private specializationRepository: Repository<Specialization>,
    ) {}

    /**
     * Get all specializations
     * @returns Array of all specializations
     */
    async getAll(): Promise<Specialization[]> {
        return this.specializationRepository.find({
            order: {
                name: 'ASC',
            },
        });
    }

    /**
     * Find a specialization by name or create it if it doesn't exist
     * @param name The name of the specialization
     * @returns The found or created specialization
     */
    async findOrCreate(name: string): Promise<Specialization> {
        const existing = await this.findByName(name);
        if (existing) {
            return existing;
        }
        
        return this.create(name);
    }

    /**
     * Find a specialization by name
     * @param name The name of the specialization to find
     * @returns The found specialization or null if not found
     */
    private async findByName(name: string): Promise<Specialization | null> {
        return this.specializationRepository.findOne({
            where: { name },
        });
    }

    /**
     * Create a new specialization
     * @param name The name of the new specialization
     * @returns The created specialization
     */
    private async create(name: string): Promise<Specialization> {
        const specialization = this.specializationRepository.create({ name });
        return this.specializationRepository.save(specialization);
    }
}