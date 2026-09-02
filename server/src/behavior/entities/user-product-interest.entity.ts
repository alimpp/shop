import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_product_interests')
@Index(['userId', 'productId'])
@Index(['sessionId', 'productId'])
@Index(['userId', 'score'])
@Index(['sessionId', 'score'])
@Index(['productId'])
export class UserProductInterest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  sessionId?: string | null;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'float', default: 0 })
  score!: number;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @Column({ type: 'int', default: 0 })
  galleryViewCount!: number;

  @Column({ type: 'int', default: 0 })
  likeCount!: number;

  @Column({ type: 'int', default: 0 })
  commentCount!: number;

  @Column({ type: 'int', default: 0 })
  favoriteCount!: number;

  @Column({ type: 'int', default: 0 })
  cartCount!: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastInteractedAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
