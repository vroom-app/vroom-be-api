import { Car } from 'src/car/entities/car.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('service_history')
export class ServiceHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  mileage: number;

  @Column()
  description: string;

  @ManyToOne(() => Car, (car) => car.serviceHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'car_id' })
  car: Car;
}
