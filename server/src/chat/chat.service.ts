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
import { UserEntity } from '../entities/user.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import {
  QueryChatsDto,
  ChatStatusFilter,
  ChatReadFilter,
} from './dto/query-chats.dto';
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
  unseenCount: string | number;
  hasUnseen: string | boolean;
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

    const lastMessageSubQuery = this.messageRepository
      .createQueryBuilder('cm')
      .distinctOn(['cm.chatId'])
      .select('cm.chatId', 'chat_id')
      .addSelect('cm.id', 'last_message_id')
      .addSelect('cm.content', 'last_message_content')
      .addSelect('cm.created_at', 'last_message_at')
      .addSelect('cm.isDeleted', 'last_message_deleted')
      .addSelect('cm.userId', 'last_message_user_id')
      .addSelect('cm.adminId', 'last_message_admin_id')
      .orderBy('cm.chatId', 'ASC')
      .addOrderBy('cm.created_at', 'DESC');

    const qb = this.chatRepository
      .createQueryBuilder('chat')
      .leftJoin(
        ChatParticipant,
        'user_participant',
        '"user_participant"."chatId" = chat.id AND "user_participant"."userId" IS NOT NULL',
      )
      .leftJoin(
        UserEntity,
        'user_info',
        'user_info.id = "user_participant"."userId"',
      )
      .leftJoin(
        ChatParticipant,
        'admin_participant',
        '"admin_participant"."chatId" = chat.id AND "admin_participant"."adminId" = :adminId',
      )
      .leftJoin(
        `(${lastMessageSubQuery.getQuery()})`,
        'last_message',
        'last_message.chat_id = chat.id',
      )
      .select('chat.id', 'chatId')
      .addSelect('chat.subject', 'subject')
      .addSelect('chat.status', 'status')
      .addSelect('chat.created_at', 'created_at')
      .addSelect('chat.updated_at', 'updated_at')
      .addSelect('last_message.last_message_id', 'lastMessageId')
      .addSelect(
        `CASE WHEN last_message.last_message_deleted = true THEN 'پیام حذف شده' ELSE last_message.last_message_content END`,
        'lastMessageContent',
      )
      .addSelect('last_message.last_message_at', 'lastMessageAt')
      .addSelect('last_message.last_message_user_id', 'lastMessageUserId')
      .addSelect('last_message.last_message_admin_id', 'lastMessageAdminId')
      .addSelect('user_info.id', 'userId')
      .addSelect('user_info.fristname', 'userFristname')
      .addSelect('user_info.lastname', 'userLastname')
      .addSelect('user_info.avatarUrl', 'userAvatarUrl')
      .addSelect('user_info.phone', 'userPhone')
      .addSelect(
        `CASE
          WHEN "admin_participant"."id" IS NULL THEN
            (SELECT COUNT(*)::int FROM chat_messages m WHERE m."chatId" = chat.id AND m."isDeleted" = false)
          ELSE COALESCE("admin_participant"."unseenCount", 0)
        END`,
        'unseenCount',
      )
      .addSelect(
        `CASE
          WHEN "admin_participant"."id" IS NULL THEN true
          WHEN "admin_participant"."unseenCount" > 0 THEN true
          ELSE false
        END`,
        'hasUnseen',
      )
      .setParameter('adminId', adminId);

    if (query.status && query.status !== ChatStatusFilter.ALL) {
      qb.andWhere('chat.status = :status', { status: query.status });
    }

    this.applyAdminReadFilter(qb, query.filter);

    const totalQb = this.chatRepository
      .createQueryBuilder('chat')
      .leftJoin(
        ChatParticipant,
        'admin_participant',
        '"admin_participant"."chatId" = chat.id AND "admin_participant"."adminId" = :adminId',
      )
      .setParameter('adminId', adminId);

    if (query.status && query.status !== ChatStatusFilter.ALL) {
      totalQb.andWhere('chat.status = :status', { status: query.status });
    }

    this.applyAdminReadFilter(totalQb, query.filter);
    const total = await totalQb.getCount();

    const raw: ChatAdminRawRow[] = await qb
      .orderBy(
        'COALESCE(last_message.last_message_at, chat.created_at)',
        'DESC',
      )
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

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
      hasUnseen: row.hasUnseen === true || row.hasUnseen === 'true',
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getChatsForUser(query: QueryChatsDto, userId: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const lastMessageSubQuery = this.messageRepository
      .createQueryBuilder('cm')
      .distinctOn(['cm.chatId'])
      .select('cm.chatId', 'chat_id')
      .addSelect('cm.id', 'last_message_id')
      .addSelect('cm.content', 'last_message_content')
      .addSelect('cm.created_at', 'last_message_at')
      .addSelect('cm.isDeleted', 'last_message_deleted')
      .orderBy('cm.chatId', 'ASC')
      .addOrderBy('cm.created_at', 'DESC');

    const qb = this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin(
        ChatParticipant,
        'user_participant',
        '"user_participant"."chatId" = chat.id AND "user_participant"."userId" = :userId',
      )
      .leftJoin(
        `(${lastMessageSubQuery.getQuery()})`,
        'last_message',
        'last_message.chat_id = chat.id',
      )
      .select('chat.id', 'chatId')
      .addSelect('chat.subject', 'subject')
      .addSelect('chat.status', 'status')
      .addSelect('chat.created_at', 'created_at')
      .addSelect('last_message.last_message_id', 'lastMessageId')
      .addSelect(
        `CASE WHEN last_message.last_message_deleted = true THEN 'پیام حذف شده' ELSE last_message.last_message_content END`,
        'lastMessageContent',
      )
      .addSelect('last_message.last_message_at', 'lastMessageAt')
      .addSelect(
        'COALESCE("user_participant"."unseenCount", 0)',
        'unseenCount',
      )
      .setParameter('userId', userId);

    if (query.status && query.status !== ChatStatusFilter.ALL) {
      qb.andWhere('chat.status = :status', { status: query.status });
    }

    const totalQb = this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin(
        ChatParticipant,
        'user_participant',
        '"user_participant"."chatId" = chat.id AND "user_participant"."userId" = :userId',
      )
      .setParameter('userId', userId);

    if (query.status && query.status !== ChatStatusFilter.ALL) {
      totalQb.andWhere('chat.status = :status', { status: query.status });
    }
    const total = await totalQb.getCount();

    const raw: ChatUserRawRow[] = await qb
      .orderBy(
        'COALESCE(last_message.last_message_at, chat.created_at)',
        'DESC',
      )
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

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
      totalPages: Math.ceil(total / limit) || 1,
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

    return {
      items: data.map((msg) => this.formatMessage(msg)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
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
      .set({ unseenCount: () => '"unseenCount" + 1' })
      .where('"chatId" = :chatId', { chatId })
      .andWhere(isAdmin ? '"userId" IS NOT NULL' : '"adminId" IS NOT NULL')
      .execute();

    const fullMessage = await this.messageRepository
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
      .where('message.id = :id', { id: message.id })
      .getOne();

    return this.formatMessage(fullMessage!);
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

  async findOrCreateSupportChatForUser(userId: string, adminId: string) {
    const existing = await this.participantRepository
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.chat', 'chat')
      .leftJoinAndSelect('participant.user', 'user')
      .where('participant.userId = :userId', { userId })
      .andWhere('chat.status = :status', { status: 'open' })
      .orderBy('chat.updated_at', 'DESC')
      .getOne();

    if (existing?.chat) {
      await this.addAdminToChat(existing.chatId, adminId);
      return {
        id: existing.chat.id,
        subject: existing.chat.subject,
        status: existing.chat.status,
        created_at: existing.chat.created_at,
        user: existing.user
          ? {
              id: existing.user.id,
              fristname: existing.user.fristname,
              lastname: existing.user.lastname,
              avatarUrl: existing.user.avatarUrl,
              phone: existing.user.phone,
            }
          : null,
      };
    }

    const created = await this.createChat({ subject: 'چت پشتیبانی' }, userId);
    await this.addAdminToChat(created.id, adminId);

    return {
      id: created.id,
      subject: created.subject,
      status: created.status,
      created_at: created.created_at,
      user: null,
    };
  }

  private async ensureChatExists(chatId: string) {
    const exists = await this.chatRepository.count({ where: { id: chatId } });
    if (!exists) {
      throw new NotFoundException('چت یافت نشد');
    }
  }

  private applyAdminReadFilter(
    qb: ReturnType<Repository<Chat>['createQueryBuilder']>,
    filter?: ChatReadFilter,
  ) {
    if (!filter || filter === ChatReadFilter.ALL) {
      return;
    }

    if (filter === ChatReadFilter.UNREAD) {
      qb.andWhere(
        `("admin_participant"."id" IS NULL OR "admin_participant"."unseenCount" > 0)`,
      );
      return;
    }

    if (filter === ChatReadFilter.READ) {
      qb.andWhere(
        `"admin_participant"."id" IS NOT NULL AND COALESCE("admin_participant"."unseenCount", 0) = 0`,
      );
    }
  }

  private formatMessage(msg: ChatMessage) {
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
  }

  private async ensureParticipant(
    chatId: string,
    userId: string,
    isAdmin: boolean,
  ) {
    if (isAdmin) {
      await this.addAdminToChat(chatId, userId);
      return;
    }

    const exists = await this.participantRepository.count({
      where: { chatId, userId },
    });
    if (!exists) {
      throw new ForbiddenException('شما عضو این چت نیستید');
    }
  }
}
