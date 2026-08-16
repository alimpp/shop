import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { TargetType } from '../enums/target-type.enum';

@Entity('comments')
@Index(['entityType', 'entityId'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: TargetType,
  })
  entityType!: TargetType;

  @Column()
  entityId!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'userId',
  })
  user?: UserEntity;

  @Column({
    type: 'text',
  })
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
