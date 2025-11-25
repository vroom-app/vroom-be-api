import { Car } from '../../entities/car.entity';
import { ExpenseType } from '../../entities/car.enums';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('expense_history')
export class ExpenseHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: ExpenseType, default: ExpenseType.Other })
  type: ExpenseType;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Car, (car) => car.expenseHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'car_id' })
  car: Car;
}
