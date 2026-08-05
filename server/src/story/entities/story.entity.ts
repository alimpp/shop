import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';

@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 500 })
  imageUrl!: string;

  @Column({ type: 'int', default: 10 })
  duration!: number;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToMany(() => UserEntity, {
    eager: true,
  })
  @JoinTable({ name: 'story_visitors' })
  visitors!: UserEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
