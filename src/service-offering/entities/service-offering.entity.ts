import { Booking } from 'src/booking/entities/booking.entity';
import { Business } from 'src/business/entities/business.entity';
import { Review } from 'src/review/entities/review.entity';
import { Slot } from 'src/slot/entities/slot.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PriceType {
  FIXED = 'fixed',
  VARIABLE = 'variable',
  STARTING = 'starting',
}

export enum DurationUnit {
  MINUTES = 'minutes',
  HOURS = 'hours',
}

@Entity('service_offerings')
export class ServiceOffering {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, (business) => business.serviceOfferings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('text', { nullable: true })
  detailedDescription: string;

  @Column('simple-array', { nullable: true })
  includedServices: string[];

  @Column('simple-array', { nullable: true })
  benefits: string[];

  @Column('decimal', { precision: 10, scale: 2, nullable: true  })
  price: number;

  @Column({
    type: 'enum',
    enum: PriceType,
    default: PriceType.FIXED,
  })
  priceType: PriceType;

  @Column('integer')
  durationMinutes: number;

  @Column({
    type: 'enum',
    enum: DurationUnit,
    default: DurationUnit.MINUTES,
    nullable: true,
  })
  durationUnit: DurationUnit;

  @Column({ type: 'text', nullable: true })
  durationNote: string;

  @Column({ type: 'text', nullable: true })
  warranty: string;

  @Column({ type: 'text', nullable: true })
  category: string;

  @Column('integer', { default: 1 })
  capacity: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Slot, (slot) => slot.serviceOffering)
  slots: Slot[];

  @OneToMany(() => Review, (review) => review.serviceOffering)
  reviews: Review[];

  @OneToMany(() => Booking, (booking) => booking.serviceOffering)
  bookings: Booking[];
}
