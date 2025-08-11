import { Car } from "src/car/entities/car.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('car_reminders')
export class CarReminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @ManyToOne(() => Car, (car) => car.reminders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'car_id' })
  car: Car;
}