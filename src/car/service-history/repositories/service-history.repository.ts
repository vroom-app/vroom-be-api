import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ServiceHistory } from "../entities/service-history.entity";

@Injectable()
export class ServiceHistoryRepository {
    constructor(@InjectRepository(ServiceHistory) private readonly repository: Repository<ServiceHistory>) {}
}
