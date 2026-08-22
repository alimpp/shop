import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { Notification } from './entities/notification.entity';
import { NotificationType } from './enums/notification-type.enum';

export type NotifyPayload = {
  userId: string;
  title: string;
  description: string;
  type: NotificationType;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * ارسال خودکار از داخل سرویس‌ها (سفارش، پرداخت، چت و ...)
   * نیازی به ادمین / REST ندارد.
   *
   * مثال:
   * await this.notificationsService.notify({
   *   userId,
   *   title: 'سفارش ثبت شد',
   *   description: 'سفارش شما با موفقیت ثبت شد',
   *   type: NotificationType.ORDER_REGISTERED,
   * });
   */
  async notify(payload: NotifyPayload) {
    return this.create(payload);
  }

  async notifyMany(
    userIds: string[],
    payload: Omit<NotifyPayload, 'userId'>,
  ) {
    const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
    if (!uniqueUserIds.length) {
      return [];
    }

    const existingUsers = await this.userRepository.find({
      where: { id: In(uniqueUserIds) },
      select: ['id'],
    });
    const existingIds = new Set(existingUsers.map((user) => user.id));

    const rows = uniqueUserIds
      .filter((userId) => existingIds.has(userId))
      .map((userId) =>
        this.notificationRepository.create({
          userId,
          title: payload.title,
          description: payload.description,
          type: payload.type,
          seen: false,
        }),
      );

    if (!rows.length) {
      return [];
    }

    const saved = await this.notificationRepository.save(rows);
    return saved.map((item) => this.toResponse(item));
  }

  async create(dto: CreateNotificationDto | NotifyPayload) {
    const userExists = await this.userRepository.count({
      where: { id: dto.userId },
    });

    if (!userExists) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    const notification = await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: dto.userId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        seen: false,
      }),
    );

    return this.toResponse(notification);
  }

  async findAllForUser(userId: string, query: QueryNotificationsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (typeof query.seen === 'boolean') {
      qb.andWhere('notification.seen = :seen', { seen: query.seen });
    }

    if (query.type) {
      qb.andWhere('notification.type = :type', { type: query.type });
    }

    qb.orderBy('notification.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      items: data.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      unreadCount: await this.countUnread(userId),
    };
  }

  async countUnread(userId: string) {
    return this.notificationRepository.count({
      where: { userId, seen: false },
    });
  }

  async findOneForUser(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('اعلان یافت نشد');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('دسترسی به این اعلان مجاز نیست');
    }

    return this.toResponse(notification);
  }

  async markAsSeen(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('اعلان یافت نشد');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('دسترسی به این اعلان مجاز نیست');
    }

    if (!notification.seen) {
      notification.seen = true;
      await this.notificationRepository.save(notification);
    }

    return this.toResponse(notification);
  }

  async markAllAsSeen(userId: string) {
    await this.notificationRepository.update(
      { userId, seen: false },
      { seen: true },
    );

    return {
      message: 'همه اعلان‌ها به عنوان خوانده‌شده علامت‌گذاری شدند',
    };
  }

  private toResponse(notification: Notification) {
    return {
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      description: notification.description,
      type: notification.type,
      seen: notification.seen,
      created_at: notification.created_at,
    };
  }
}
