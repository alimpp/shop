import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { AdminEntity } from '../../entities/admin.entity';
import { Chat } from './chat.entity';

@Entity('chat_participants')
@Index(['chatId', 'userId'], { unique: true })
@Index(['chatId', 'adminId'], { unique: true })
export class ChatParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  chatId!: string;

  @ManyToOne(() => Chat, (chat) => chat.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat?: Chat;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column({ nullable: true })
  adminId?: string;

  @ManyToOne(() => AdminEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'adminId' })
  admin?: AdminEntity;

  @Column({ type: 'timestamp', nullable: true })
  lastReadAt?: Date;

  @Column({ default: 0 })
  unseenCount!: number;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
