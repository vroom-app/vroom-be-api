import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseHistory } from '../entities/expense-history.entity';

@Injectable()
export class ExpenseHistoryRepository {
  constructor(
    @InjectRepository(ExpenseHistory)
    private readonly repository: Repository<ExpenseHistory>,
  ) {}
}
