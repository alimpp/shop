import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BehaviorEventType } from '../enums/behavior-event-type.enum';

@Entity('user_product_events')
@Index(['userId', 'createdAt'])
@Index(['sessionId', 'createdAt'])
@Index(['productId', 'createdAt'])
@Index(['eventType', 'createdAt'])
export class UserProductEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  sessionId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  productId?: string | null;

  @Column({
    type: 'enum',
    enum: BehaviorEventType,
  })
  eventType!: BehaviorEventType;

  @Column({ type: 'float', default: 0 })
  scoreDelta!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
