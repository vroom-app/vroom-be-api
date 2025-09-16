import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TireHistory } from "../entities/tire-history.entity";
import { Repository } from "typeorm";

@Injectable()
export class TireHistoryRepository {
    constructor(@InjectRepository(TireHistory) private readonly repository: Repository<TireHistory>) {}
}
