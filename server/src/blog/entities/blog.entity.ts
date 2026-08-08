import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { BlogStatus } from '../enums/blog-status.enum';
import { BlogSection } from './blog-section.entity';

@Entity('blogs')
@Index(['slug'], { unique: true })
@Index(['status'])
@Index(['isFeatured'])
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    length: 200,
  })
  title!: string;

  @Column({
    unique: true,
    length: 220,
  })
  slug!: string;

  @Column({
    type: 'text',
  })
  summary!: string;

  @Column({
    length: 500,
  })
  coverImage!: string;

  @Column({
    type: 'enum',
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  status!: BlogStatus;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @Column({
    default: false,
  })
  isFeatured!: boolean;

  @Column({
    default: 0,
  })
  viewCount!: number;

  @Column({
    default: 0,
  })
  likeCount!: number;

  @Column({
    default: 0,
  })
  commentCount!: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  publishedAt?: Date;

  /*
   |--------------------------------------------------------------------------
   | SEO
   |--------------------------------------------------------------------------
   */

  @Column({
    nullable: true,
    length: 255,
  })
  metaTitle?: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  metaDescription?: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  keywords?: string;

  @Column({
    nullable: true,
    length: 500,
  })
  canonical?: string;

  @Column({
    nullable: true,
    length: 500,
  })
  ogImage?: string;

  /*
   |--------------------------------------------------------------------------
   | Relations
   |--------------------------------------------------------------------------
   */

  @OneToMany(() => BlogSection, (section) => section.blog, {
    cascade: false,
  })
  sections!: BlogSection[];

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'blog_products',
    joinColumn: {
      name: 'blogId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'productId',
      referencedColumnName: 'id',
    },
  })
  products!: Product[];

  /*
   |--------------------------------------------------------------------------
   | Dates
   |--------------------------------------------------------------------------
   */

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
