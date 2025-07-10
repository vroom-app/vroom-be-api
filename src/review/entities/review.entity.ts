import { Business } from 'src/business/entities/business.entity';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  businessId: string;

  @ManyToOne(() => Business, (business) => business.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column({ nullable: true })
  @Index()
  serviceId: number;

  @ManyToOne(() => ServiceOffering, (offering) => offering.reviews)
  @JoinColumn({ name: 'serviceId' })
  serviceOffering: ServiceOffering;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('integer')
  rating: number;

  @Column()
  comment: string;

  @Column({ name: 'communication_rating', nullable: true })
  communicationRating?: number;

  @Column({ name: 'quality_rating', nullable: true })
  qualityRating?: number;

  @Column({ name: 'punctuality_rating', nullable: true })
  punctualityRating?: number;

  @CreateDateColumn()
  createdAt: Date;
}
