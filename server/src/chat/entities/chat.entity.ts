import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatMessage } from './chat-message.entity';
import { ChatParticipant } from './chat-participant.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  subject?: string;

  @Column({ default: 'open' })
  status!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @OneToMany(() => ChatMessage, (message) => message.chat)
  messages?: ChatMessage[];

  @OneToMany(() => ChatParticipant, (participant) => participant.chat)
  participants?: ChatParticipant[];
}
