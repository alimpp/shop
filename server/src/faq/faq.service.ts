import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateFaqDto,
  QueryFaqDto,
  UpdateFaqDto,
} from './dto/create-faq.dto';
import { Faq } from './entities/faq.entity';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
  ) {}

  async create(dto: CreateFaqDto) {
    const entity = this.faqRepository.create({
      question: dto.question.trim(),
      answer: dto.answer.trim(),
      category: dto.category?.trim() || null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      isFeatured: dto.isFeatured ?? false,
    });
    return this.toResponse(await this.faqRepository.save(entity));
  }

  async findAll(query: QueryFaqDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const qb = this.faqRepository
      .createQueryBuilder('faq')
      .orderBy('faq.sortOrder', 'ASC')
      .addOrderBy('faq.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (typeof query.isActive === 'boolean') {
      qb.andWhere('faq.isActive = :isActive', { isActive: query.isActive });
    }

    if (typeof query.isFeatured === 'boolean') {
      qb.andWhere('faq.isFeatured = :isFeatured', {
        isFeatured: query.isFeatured,
      });
    }

    if (query.category?.trim()) {
      qb.andWhere('faq.category ILIKE :category', {
        category: query.category.trim(),
      });
    }

    if (query.search?.trim()) {
      qb.andWhere(
        '(faq.question ILIKE :search OR faq.answer ILIKE :search OR faq.category ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((item) => this.toResponse(item)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findAllPublic(query: QueryFaqDto) {
    return this.findAll({
      ...query,
      isActive: true,
      limit: query.limit ?? 100,
    });
  }

  async findOne(id: string) {
    const item = await this.faqRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('سوال متداول یافت نشد');
    return this.toResponse(item);
  }

  async update(id: string, dto: UpdateFaqDto) {
    const item = await this.faqRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('سوال متداول یافت نشد');

    if (dto.question !== undefined) item.question = dto.question.trim();
    if (dto.answer !== undefined) item.answer = dto.answer.trim();
    if (dto.category !== undefined) {
      item.category = dto.category?.trim() || null;
    }
    if (dto.sortOrder !== undefined) item.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) item.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) item.isFeatured = dto.isFeatured;

    return this.toResponse(await this.faqRepository.save(item));
  }

  async remove(id: string) {
    const item = await this.faqRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('سوال متداول یافت نشد');
    await this.faqRepository.remove(item);
    return { id, deleted: true };
  }

  private toResponse(item: Faq) {
    return {
      id: item.id,
      question: item.question,
      answer: item.answer,
      category: item.category,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      isFeatured: item.isFeatured,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
