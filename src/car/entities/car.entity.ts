import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CarFuel } from './car-fuel';
import { Exclude } from 'class-transformer';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ name: 'plate_number' })
  plateNumber: string;

  @Column({ type: 'enum', enum: CarFuel, default: CarFuel.OTHER })
  fuel: CarFuel;

  @Column({ nullable: true })
  color?: string;

  @ManyToOne(() => User, (user) => user.cars, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
