import { Booking } from 'src/booking/entities/booking.entity';
import { Business } from 'src/business/entities/business.entity';
import { Car } from 'src/car/entities/car.entity';
import { Review } from 'src/review/entities/review.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum UserRole {
  USER = 'user',
  BUSINESS_OWNER = 'business_owner',
  WORKER = 'worker',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ default: 'BG' })
  country: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    default: [UserRole.USER],
    array: true,
  })
  roles: UserRole[];

  @OneToMany(() => Business, (business) => business.owner)
  ownedBusinesses: Business[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Car, (car) => car.user)
  cars: Car[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
