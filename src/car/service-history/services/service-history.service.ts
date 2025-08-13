import { Injectable, Logger } from "@nestjs/common";
import { ServiceHistoryRepository } from "./service-history.repository";

@Injectable()
export class ServiceHistoryService {
  private readonly logger = new Logger(ServiceHistoryService.name);
  
  constructor(
    private readonly repository: ServiceHistoryRepository,
  ) {}
}