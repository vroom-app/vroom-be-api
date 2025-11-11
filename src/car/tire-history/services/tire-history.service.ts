import { Injectable, Logger } from '@nestjs/common';
import { TireHistoryRepository } from '../repositories/tire-history.repository';

@Injectable()
export class TireHistoryService {
  private readonly logger = new Logger(TireHistoryService.name);

  constructor(private readonly repository: TireHistoryRepository) {}
}
