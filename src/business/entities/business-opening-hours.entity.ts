import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Business } from './business.entity';

@Entity('business_opening_hours')
export class BusinessOpeningHours {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'business_id' })
  businessId: string;

  @ManyToOne(() => Business, (business) => business.openingHours, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column('smallint', { name: 'day_of_week' })
  dayOfWeek: number;

  @Column('time', { name: 'opens_at' })
  opensAt: string;

  @Column('time', { name: 'closes_at' })
  closesAt: string;
}
