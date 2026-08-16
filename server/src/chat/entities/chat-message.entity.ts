import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { AdminEntity } from '../../entities/admin.entity';
import { Chat } from './chat.entity';

@Entity('chat_messages')
@Index(['chatId', 'created_at'])
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  chatId!: string;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
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

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ nullable: true })
  replyToId?: string;

  @ManyToOne(() => ChatMessage, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'replyToId' })
  replyTo?: ChatMessage;

  @Column({ default: false })
  isDeleted!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
