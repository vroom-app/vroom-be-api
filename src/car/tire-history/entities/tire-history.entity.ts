import { Car } from 'src/car/entities/car.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tire_history')
export class TireHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  size: string;

  @Column()
  type: string;

  @ManyToOne(() => Car, (car) => car.tireHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'car_id' })
  car: Car;
}
