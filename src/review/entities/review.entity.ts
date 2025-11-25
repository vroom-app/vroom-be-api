import { Business } from '../../business/entities/business.entity';
import { User } from '../../users/entities/user.entity';
import { ReviewedService } from './review-service.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Business, (business) => business.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  @Index()
  business: Business;

  @Column({ name: 'business_id' })
  businessId: string;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column('integer')
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'jsonb', nullable: true })
  ratings?: {
    communication?: number;
    quality?: number;
    punctuality?: number;
    [key: string]: number | undefined;
  };

  @OneToMany(() => ReviewedService, (rs) => rs.review, { cascade: true })
  reviewServices: ReviewedService[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
