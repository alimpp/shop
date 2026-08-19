import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { ProductVariant } from '../../product/entities/product-variant.entity';
import {
  OrderSelectedOptionSnapshot,
  OrderVariantSnapshot,
} from '../types/order-snapshot';
import { Order } from './order.entity';

@Entity('order_items')
@Index(['orderId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  orderId!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order?: Order;

  @Column({ nullable: true })
  productId!: string | null;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'productId' })
  product?: Product | null;

  @Column({ type: 'uuid', nullable: true })
  variantId!: string | null;

  @ManyToOne(() => ProductVariant, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'variantId' })
  variant?: ProductVariant | null;

  @Column({ length: 200 })
  productName!: string;

  @Column({ length: 220 })
  productSlug!: string;

  @Column({ type: 'text', default: '' })
  productImage!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  lineTotal!: number;

  @Column({ type: 'jsonb', nullable: true })
  variantSnapshot!: OrderVariantSnapshot | null;

  @Column({ type: 'jsonb', default: [] })
  selectedOptions!: OrderSelectedOptionSnapshot[];
}
