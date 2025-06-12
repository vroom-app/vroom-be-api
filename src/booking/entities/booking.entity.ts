import { ServiceOffering } from "src/service-offering/entities/service-offering.entity";
import { Slot } from "src/slot/entities/slot.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum BookingStatus {
    CREATED = 'created',
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}
  
@Entity('bookings')
@Index(['guestEmail'])
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId?: number;

  @ManyToOne(() => User, user => user.bookings, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column()
  slotId: number;

  @ManyToOne(() => Slot, slot => slot.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'slotId' })
  slot: Slot;

  @Column()
  serviceOfferingId: number;

  @ManyToOne(() => ServiceOffering, offering => offering.bookings)
  @JoinColumn({ name: 'serviceOfferingId' })
  serviceOffering: ServiceOffering;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CREATED
  })
  status: BookingStatus;

  @Column({ nullable: true, length: 500 })
  specialRequests?: string;

  @Column({ nullable: true, length: 100 })
  guestName?: string;

  @Column({ nullable: true, length: 255 })
  guestEmail?: string;

  @Column({ nullable: true, length: 20 })
  guestPhone?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}