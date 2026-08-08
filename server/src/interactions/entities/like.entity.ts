import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TargetType } from '../enums/target-type.enum';

@Entity('likes')
@Index(['entityType', 'entityId'])
@Index(['userId', 'entityType', 'entityId'], { unique: true })
export class Like {
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

  @CreateDateColumn()
  createdAt!: Date;
}
