import { User } from '../../users/entities/user.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { ExpenseHistory } from '../expense-history/entities/expense-history.entity';
import { TireHistory } from '../tire-history/entities/tire-history.entity';
import { ServiceHistory } from '../service-history/entities/service-history.entity';
import { CarReminder } from '../reminders/entities/reminder.entity';
import { CarFuel, CarType } from './car.enums';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  licensePlate: string;

  @Column()
  model: string;

  @Column()
  brand: string;

  // ── OPTIONAL ────────────────────────────────────────────────────────

  @Column({ nullable: true })
  year?: number;

  @Column({ type: 'enum', enum: CarType, default: CarType.Other })
  type: CarType;

  @Column({ nullable: true, unique: true })
  vin?: string;

  @Column({ nullable: true })
  enginePower?: string;

  @Column({ nullable: true })
  engineVolume?: string;

  @Column({ nullable: true })
  euroStandard?: string;

  @Column({ nullable: true })
  color?: string;

  @Column({
    type: 'enum',
    enum: CarFuel,
    nullable: true,
  })
  oilType?: CarFuel;

  @Column({ type: 'date', nullable: true })
  vignetteExpiry?: Date;

  @Column({ type: 'date', nullable: true })
  gtpExpiry?: Date;

  @Column({ type: 'date', nullable: true })
  civilInsuranceExpiry?: Date;

  @Column({ type: 'date', nullable: true })
  cascoExpiry?: Date;

  @Column({ type: 'date', nullable: true })
  taxExpiry?: Date;

  @Column({ nullable: true })
  mileage?: number;

  @Column({ nullable: true })
  photo?: string;

  // ── RELATIONS ───────────────────────────────────────────────────────

  @ManyToMany(() => User, (user) => user.cars, { cascade: true })
  @JoinTable({
    name: 'car_users',
    joinColumn: { name: 'car_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];

  @OneToMany(() => CarReminder, (reminder) => reminder.car, { cascade: true })
  reminders?: CarReminder[];

  @OneToMany(() => ServiceHistory, (service) => service.car, { cascade: true })
  serviceHistory?: ServiceHistory[];

  @OneToMany(() => TireHistory, (tire) => tire.car, { cascade: true })
  tireHistory?: TireHistory[];

  @OneToMany(() => ExpenseHistory, (expense) => expense.car, { cascade: true })
  expenseHistory?: ExpenseHistory[];

  // ── AUDIT ───────────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
