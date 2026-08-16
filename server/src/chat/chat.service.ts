import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { QueryChatsDto, ChatStatusFilter } from './dto/query-chats.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';

interface ChatAdminRawRow {
  chatId: string;
  subject: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
  lastMessageId: string | null;
  lastMessageContent: string | null;
  lastMessageAt: Date | null;
  lastMessageDeleted: boolean;
  lastMessageUserId: string | null;
  lastMessageAdminId: string | null;
  userId: string | null;
  userFristname: string | null;
  userLastname: string | null;
  userAvatarUrl: string | null;
  userPhone: string | null;
  unseenCount: string;
  hasUnseen: string;
}

interface ChatUserRawRow {
  chatId: string;
  subject: string | null;
  status: string;
  created_at: Date;
  lastMessageId: string | null;
  lastMessageContent: string | null;
  lastMessageAt: Date | null;
  lastMessageDeleted: boolean;
  unseenCount: string;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,

    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,

    @InjectRepository(ChatParticipant)
    private readonly participantRepository: Repository<ChatParticipant>,
  ) {}

  async createChat(dto: CreateChatDto, userId: string) {
    const chat = await this.chatRepository.save(
      this.chatRepository.create({ subject: dto.subject }),
    );

    await this.participantRepository.save(
      this.participantRepository.create({ chatId: chat.id, userId }),
    );

    return chat;
  }

  async getChatsForAdmin(query: QueryChatsDto, adminId: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.chatRepository
      .createQueryBuilder('chat')

      .innerJoin(
        (sub) =>
          sub
            .select('cp_admin.chatId', 'chatId')
            .from(ChatParticipant, 'cp_admin')
            .where('cp_admin.adminId = :adminId', { adminId }),
        'admin_participant',
        'admin_participant.chatId = chat.id',
      )

      .leftJoin(
        (sub) =>
          sub
            .select('cm.chatId', 'chatId')
            .addSelect('cm.id', 'lastMessageId')
            .addSelect('cm.content', 'lastMessageContent')
            .addSelect('cm.created_at', 'lastMessageAt')
            .addSelect('cm.isDeleted', 'lastMessageDeleted')
            .addSelect('cm.userId', 'lastMessageUserId')
            .addSelect('cm.adminId', 'lastMessageAdminId')
            .from(ChatMessage, 'cm')
            .innerJoin(
              (sub2) =>
                sub2
                  .select('cm2.chatId', 'chatId')
                  .addSelect('MAX(cm2.created_at)', 'maxCreatedAt')
                  .from(ChatMessage, 'cm2')
                  .groupBy('cm2.chatId'),
              'cm_latest',
              'cm_latest.chatId = cm.chatId AND cm_latest.maxCreatedAt = cm.created_at',
            ),
        'last_message',
        'last_message.chatId = chat.id',
      )

      .leftJoin(
        (sub) =>
          sub
            .select('cp_user.userId', 'userId')
            .addSelect('cp_user.chatId', 'chatId')
            .from(ChatParticipant, 'cp_user')
            .where('cp_user.userId IS NOT NULL'),
        'user_participant',
        'user_participant.chatId = chat.id',
      )

      .leftJoin(
        (sub) =>
          sub
            .select('u.id', 'id')
            .addSelect('u.fristname', 'fristname')
            .addSelect('u.lastname', 'lastname')
            .addSelect('u.avatarUrl', 'avatarUrl')
            .addSelect('u.phone', 'phone')
            .from('user_entity', 'u'),
        'user_info',
        'user_info.id = user_participant.userId',
      )

      .addSelect('chat.id', 'chatId')
      .addSelect('chat.subject', 'subject')
      .addSelect('chat.status', 'status')
      .addSelect('chat.created_at', 'created_at')
      .addSelect('chat.updated_at', 'updated_at')

      .addSelect('last_message.lastMessageId', 'lastMessageId')
      .addSelect(
        `CASE WHEN last_message.lastMessageDeleted = true THEN 'پیام حذف شده' ELSE last_message.lastMessageContent END`,
        'lastMessageContent',
      )
      .addSelect('last_message.lastMessageAt', 'lastMessageAt')
      .addSelect('last_message.lastMessageUserId', 'lastMessageUserId')
      .addSelect('last_message.lastMessageAdminId', 'lastMessageAdminId')

      .addSelect('user_info.id', 'userId')
      .addSelect('user_info.fristname', 'userFristname')
      .addSelect('user_info.lastname', 'userLastname')
      .addSelect('user_info.avatarUrl', 'userAvatarUrl')
      .addSelect('user_info.phone', 'userPhone')

      .addSelect(
        '(SELECT cp.unseenCount FROM chat_participants cp WHERE cp.chatId = chat.id AND cp.adminId = :adminId)',
        'unseenCount',
      )
      .addSelect(
        `(SELECT CASE WHEN cp.unseenCount > 0 THEN true ELSE false END FROM chat_participants cp WHERE cp.chatId = chat.id AND cp.adminId = :adminId)`,
        'hasUnseen',
      )

      .setParameters({ adminId });

    if (query.status && query.status !== ChatStatusFilter.ALL) {
      qb.andWhere('chat.status = :status', { status: query.status });
    }

    qb.orderBy('COALESCE(last_message.lastMessageAt, chat.created_at)', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const raw: ChatAdminRawRow[] = await qb.getRawMany();
    const total = await qb.getCount();

    const items = raw.map((row) => ({
      id: row.chatId,
      subject: row.subject,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      lastMessage: row.lastMessageId
        ? {
            id: row.lastMessageId,
            content: row.lastMessageContent,
            createdAt: row.lastMessageAt,
            senderUserId: row.lastMessageUserId,
            senderAdminId: row.lastMessageAdminId,
          }
        : null,
      user: row.userId
        ? {
            id: row.userId,
            fristname: row.userFristname,
            lastname: row.userLastname,
            avatarUrl: row.userAvatarUrl,
            phone: row.userPhone,
          }
        : null,
      unseenCount: Number(row.unseenCount) || 0,
      hasUnseen: row.hasUnseen === 'true',
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getChatsForUser(query: QueryChatsDto, userId: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.chatRepository
      .createQueryBuilder('chat')

      .innerJoin(
        (sub) =>
          sub
            .select('cp_user.chatId', 'chatId')
            .from(ChatParticipant, 'cp_user')
            .where('cp_user.userId = :userId', { userId }),
        'user_participant',
        'user_participant.chatId = chat.id',
      )

      .leftJoin(
        (sub) =>
          sub
            .select('cm.chatId', 'chatId')
            .addSelect('cm.id', 'lastMessageId')
            .addSelect('cm.content', 'lastMessageContent')
            .addSelect('cm.created_at', 'lastMessageAt')
            .addSelect('cm.isDeleted', 'lastMessageDeleted')
            .from(ChatMessage, 'cm')
            .innerJoin(
              (sub2) =>
                sub2
                  .select('cm2.chatId', 'chatId')
                  .addSelect('MAX(cm2.created_at)', 'maxCreatedAt')
                  .from(ChatMessage, 'cm2')
                  .groupBy('cm2.chatId'),
              'cm_latest',
              'cm_latest.chatId = cm.chatId AND cm_latest.maxCreatedAt = cm.created_at',
            ),
        'last_message',
        'last_message.chatId = chat.id',
      )

      .addSelect('chat.id', 'chatId')
      .addSelect('chat.subject', 'subject')
      .addSelect('chat.status', 'status')
      .addSelect('chat.created_at', 'created_at')

      .addSelect('last_message.lastMessageId', 'lastMessageId')
      .addSelect(
        `CASE WHEN last_message.lastMessageDeleted = true THEN 'پیام حذف شده' ELSE last_message.lastMessageContent END`,
        'lastMessageContent',
      )
      .addSelect('last_message.lastMessageAt', 'lastMessageAt')

      .addSelect(
        '(SELECT cp.unseenCount FROM chat_participants cp WHERE cp.chatId = chat.id AND cp.userId = :userId)',
        'unseenCount',
      )

      .setParameters({ userId });

    if (query.status && query.status !== ChatStatusFilter.ALL) {
      qb.andWhere('chat.status = :status', { status: query.status });
    }

    qb.orderBy('COALESCE(last_message.lastMessageAt, chat.created_at)', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const raw: ChatUserRawRow[] = await qb.getRawMany();
    const total = await qb.getCount();

    const items = raw.map((row) => ({
      id: row.chatId,
      subject: row.subject,
      status: row.status,
      created_at: row.created_at,
      lastMessage: row.lastMessageId
        ? {
            id: row.lastMessageId,
            content: row.lastMessageContent,
            createdAt: row.lastMessageAt,
          }
        : null,
      unseenCount: Number(row.unseenCount) || 0,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMessages(
    chatId: string,
    query: QueryMessagesDto,
    userId: string,
    isAdmin: boolean,
  ) {
    await this.ensureChatExists(chatId);
    await this.ensureParticipant(chatId, userId, isAdmin);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.user', 'user')
      .addSelect([
        'user.id',
        'user.fristname',
        'user.lastname',
        'user.avatarUrl',
        'user.phone',
      ])
      .leftJoin('message.admin', 'admin')
      .addSelect(['admin.id', 'admin.username', 'admin.role'])
      .leftJoin('message.replyTo', 'replyTo')
      .addSelect([
        'replyTo.id',
        'replyTo.content',
        'replyTo.isDeleted',
        'replyTo.userId',
        'replyTo.adminId',
        'replyTo.created_at',
      ])
      .leftJoin('replyTo.user', 'replyToUser')
      .addSelect([
        'replyToUser.id',
        'replyToUser.fristname',
        'replyToUser.lastname',
      ])
      .leftJoin('replyTo.admin', 'replyToAdmin')
      .addSelect(['replyToAdmin.id', 'replyToAdmin.username'])
      .where('message.chatId = :chatId', { chatId })
      .orderBy('message.created_at', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    const items = data.map((msg) => {
      if (msg.isDeleted) {
        return {
          id: msg.id,
          chatId: msg.chatId,
          content: null,
          isDeleted: true,
          deletedAt: msg.deletedAt,
          created_at: msg.created_at,
          sender: null,
          replyTo: msg.replyTo
            ? {
                id: msg.replyTo.id,
                content: msg.replyTo.isDeleted ? null : msg.replyTo.content,
                isDeleted: msg.replyTo.isDeleted,
                sender: msg.replyTo.user
                  ? {
                      id: msg.replyTo.user.id,
                      fristname: msg.replyTo.user.fristname,
                      lastname: msg.replyTo.user.lastname,
                    }
                  : msg.replyTo.admin
                    ? {
                        id: msg.replyTo.admin.id,
                        username: msg.replyTo.admin.username,
                      }
                    : null,
              }
            : null,
        };
      }

      return {
        id: msg.id,
        chatId: msg.chatId,
        content: msg.content,
        isDeleted: false,
        created_at: msg.created_at,
        sender: msg.user
          ? {
              id: msg.user.id,
              fristname: msg.user.fristname,
              lastname: msg.user.lastname,
              avatarUrl: msg.user.avatarUrl,
              phone: msg.user.phone,
            }
          : msg.admin
            ? {
                id: msg.admin.id,
                username: msg.admin.username,
                role: msg.admin.role,
              }
            : null,
        replyTo: msg.replyTo
          ? {
              id: msg.replyTo.id,
              content: msg.replyTo.isDeleted ? null : msg.replyTo.content,
              isDeleted: msg.replyTo.isDeleted,
              sender: msg.replyTo.user
                ? {
                    id: msg.replyTo.user.id,
                    fristname: msg.replyTo.user.fristname,
                    lastname: msg.replyTo.user.lastname,
                  }
                : msg.replyTo.admin
                  ? {
                      id: msg.replyTo.admin.id,
                      username: msg.replyTo.admin.username,
                    }
                  : null,
            }
          : null,
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async sendMessage(
    chatId: string,
    dto: SendMessageDto,
    userId: string,
    isAdmin: boolean,
  ) {
    await this.ensureChatExists(chatId);
    await this.ensureParticipant(chatId, userId, isAdmin);

    if (dto.replyToId) {
      const replyTarget = await this.messageRepository.findOne({
        where: { id: dto.replyToId, chatId },
      });
      if (!replyTarget) {
        throw new BadRequestException('پیام موردنظر برای پاسخ یافت نشد');
      }
    }

    const message = await this.messageRepository.save(
      this.messageRepository.create({
        chatId,
        userId: isAdmin ? undefined : userId,
        adminId: isAdmin ? userId : undefined,
        content: dto.content,
        replyToId: dto.replyToId,
      }),
    );

    await this.participantRepository
      .createQueryBuilder()
      .update(ChatParticipant)
      .set({ unseenCount: () => 'unseenCount + 1' })
      .where('chatId = :chatId', { chatId })
      .andWhere(isAdmin ? 'userId IS NOT NULL' : 'adminId IS NOT NULL')
      .execute();

    return message;
  }

  async deleteMessage(
    chatId: string,
    messageId: string,
    userId: string,
    isAdmin: boolean,
  ) {
    await this.ensureChatExists(chatId);
    await this.ensureParticipant(chatId, userId, isAdmin);

    const message = await this.messageRepository.findOne({
      where: { id: messageId, chatId },
    });

    if (!message) {
      throw new NotFoundException('پیام یافت نشد');
    }

    const isOwner = message.userId === userId || message.adminId === userId;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('شما فقط می‌توانید پیام خودتان را حذف کنید');
    }

    message.isDeleted = true;
    message.content = undefined;
    message.deletedAt = new Date();
    await this.messageRepository.save(message);

    return { message: 'پیام با موفقیت حذف شد' };
  }

  async markAsRead(chatId: string, userId: string, isAdmin: boolean) {
    await this.ensureChatExists(chatId);
    await this.ensureParticipant(chatId, userId, isAdmin);

    const where = isAdmin ? { chatId, adminId: userId } : { chatId, userId };

    await this.participantRepository.update(where, {
      lastReadAt: new Date(),
      unseenCount: 0,
    });

    return { message: 'چت به عنوان خوانده شده علامت‌گذاری شد' };
  }

  async getChatById(chatId: string) {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('چت یافت نشد');
    }
    return chat;
  }

  async addAdminToChat(chatId: string, adminId: string) {
    await this.ensureChatExists(chatId);

    const existing = await this.participantRepository.findOne({
      where: { chatId, adminId },
    });

    if (!existing) {
      await this.participantRepository.save(
        this.participantRepository.create({ chatId, adminId }),
      );
    }
  }

  private async ensureChatExists(chatId: string) {
    const exists = await this.chatRepository.count({ where: { id: chatId } });
    if (!exists) {
      throw new NotFoundException('چت یافت نشد');
    }
  }

  private async ensureParticipant(
    chatId: string,
    userId: string,
    isAdmin: boolean,
  ) {
    const where = isAdmin ? { chatId, adminId: userId } : { chatId, userId };

    const exists = await this.participantRepository.count({ where });
    if (!exists) {
      throw new ForbiddenException('شما عضو این چت نیستید');
    }
  }
}
