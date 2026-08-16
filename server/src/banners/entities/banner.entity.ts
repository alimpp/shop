import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('banners')
@Index(['isActive'])
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    length: 180,
  })
  title!: string;

  @Column({
    nullable: true,
    length: 220,
  })
  subtitle?: string;

  @Column({
    length: 500,
  })
  imageUrl!: string;

  @Column({
    nullable: true,
    length: 1000,
  })
  link?: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  description?: string;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
