import { Injectable, Logger } from "@nestjs/common";
import { ExpenseHistoryRepository } from "../repositories/expense-history.repository";

@Injectable()
export class ExpenseHistoryService {
  private readonly logger = new Logger(ExpenseHistoryService.name);
  
  constructor(
    private readonly repository: ExpenseHistoryRepository,
  ) {}
}