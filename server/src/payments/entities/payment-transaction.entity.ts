import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { PaymentTransactionStatus } from '../enums/payment-transaction-status.enum';
import { PaymentTransactionType } from '../enums/payment-transaction-type.enum';

@Entity('payment_transactions')
@Index(['userId', 'createdAt'])
@Index(['orderId'])
@Index(['status'])
@Index(['trackingCode'], { unique: true })
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 40, unique: true })
  trackingCode!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column({ type: 'uuid', nullable: true })
  orderId!: string | null;

  @ManyToOne(() => Order, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'orderId' })
  order?: Order | null;

  @Column({
    type: 'varchar',
    length: 40,
    default: PaymentTransactionType.ORDER,
  })
  type!: PaymentTransactionType;

  @Column({
    type: 'varchar',
    length: 40,
    default: PaymentTransactionStatus.UNKNOWN,
  })
  status!: PaymentTransactionStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  gateway!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  gatewayRef!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
