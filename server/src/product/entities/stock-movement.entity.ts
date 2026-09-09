import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  StockMovementActorType,
  StockMovementReason,
} from '../enums/stock-movement.enum';

@Entity('stock_movements')
@Index(['productId'])
@Index(['variantId'])
@Index(['orderId'])
@Index(['createdAt'])
@Index(['reason'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  productId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  variantId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  orderId!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  productName!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  variantName!: string | null;

  @Column({ type: 'int' })
  quantityChange!: number;

  @Column({ type: 'int' })
  stockBefore!: number;

  @Column({ type: 'int' })
  stockAfter!: number;

  @Column({ type: 'varchar', length: 40 })
  reason!: StockMovementReason;

  @Column({ type: 'varchar', length: 20 })
  actorType!: StockMovementActorType;

  @Column({ type: 'uuid', nullable: true })
  actorId!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
