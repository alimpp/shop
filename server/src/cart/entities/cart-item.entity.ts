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
import { Product } from '../../product/entities/product.entity';
import { ProductVariant } from '../../product/entities/product-variant.entity';

export interface CartSelectedOptionSnapshot {
  attributeId: string;
  attributeName: string;
  optionValueId: string;
  attributeValueId: string;
  value: string;
}

@Entity('cart_items')
@Index(['userId', 'lineKey'], { unique: true })
@Index(['userId'])
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column()
  productId!: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @Column({ type: 'uuid', nullable: true })
  variantId!: string | null;

  @ManyToOne(() => ProductVariant, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'variantId' })
  variant?: ProductVariant | null;

  /** product/variant + selected option values */
  @Column({ default: '' })
  lineKey!: string;

  @Column({ type: 'jsonb', default: [] })
  selectedOptions!: CartSelectedOptionSnapshot[];

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
