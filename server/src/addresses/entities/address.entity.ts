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

@Entity('addresses')
@Index(['userId'])
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column({ length: 80 })
  name!: string;

  @Column({ length: 80 })
  province!: string;

  @Column({ length: 80 })
  city!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ length: 10 })
  postalCode!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
