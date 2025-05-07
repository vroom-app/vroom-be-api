import { ServiceOffering } from "src/service-offering/entities/service-offering.entity";
import { Slot } from "src/slot/entities/slot.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}
  
@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    userId: number;
  
    @ManyToOne(() => User, user => user.bookings)
    @JoinColumn({ name: 'userId' })
    user: User;
  
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
      default: BookingStatus.PENDING
    })
    status: BookingStatus;
  
    @Column({ nullable: true })
    specialRequests: string;
  
    @CreateDateColumn()
    createdAt: Date;
}