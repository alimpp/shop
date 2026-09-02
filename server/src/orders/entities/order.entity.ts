import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderAddressSnapshot } from '../types/order-snapshot';
import { OrderItem } from './order-item.entity';

@Entity('orders')
@Index(['userId'])
@Index(['status'])
@Index(['orderNumber'], { unique: true })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 40 })
  orderNumber!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column({ type: 'varchar', length: 40, default: OrderStatus.PENDING_CONFIRMATION })
  status!: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotalAmount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount!: number;

  @Column({ type: 'varchar', length: 40, nullable: true })
  discountCode!: string | null;

  @Column({ type: 'uuid', nullable: true })
  discountCodeId!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  paidAmount!: number;

  @Column({ type: 'uuid', nullable: true })
  addressId!: string | null;

  @Column({ type: 'jsonb' })
  address!: OrderAddressSnapshot;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
