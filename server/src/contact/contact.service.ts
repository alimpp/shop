import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { QueryContactMessagesDto } from './dto/query-contact-messages.dto';
import { ContactMessage } from './entities/contact-message.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,
  ) {}

  async create(dto: CreateContactMessageDto) {
    const entity = this.contactRepository.create({
      name: dto.name,
      phone: dto.phone,
      subject: dto.subject ?? null,
      message: dto.message,
      isRead: false,
      readAt: null,
    });

    const saved = await this.contactRepository.save(entity);

    return {
      id: saved.id,
      createdAt: saved.createdAt,
    };
  }

  async findAll(query: QueryContactMessagesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter = query.filter ?? 'all';
    const search = query.search?.trim();

    const qb = this.contactRepository
      .createQueryBuilder('message')
      .orderBy('message.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filter === 'read') {
      qb.andWhere('message.isRead = :isRead', { isRead: true });
    } else if (filter === 'unread') {
      qb.andWhere('message.isRead = :isRead', { isRead: false });
    }

    if (search) {
      qb.andWhere(
        '(message.name ILIKE :search OR message.phone ILIKE :search OR message.subject ILIKE :search OR message.message ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await qb.getManyAndCount();
    const unreadCount = await this.contactRepository.count({
      where: { isRead: false },
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        unreadCount,
      },
    };
  }

  async findOne(id: string, markAsRead = true) {
    const message = await this.contactRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('پیام یافت نشد');
    }

    if (markAsRead && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await this.contactRepository.save(message);
    }

    return message;
  }

  async markAsRead(id: string) {
    return this.findOne(id, true);
  }

  async remove(id: string) {
    const message = await this.contactRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('پیام یافت نشد');
    }

    await this.contactRepository.remove(message);
    return { id, deleted: true };
  }
}
