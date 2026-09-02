import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { QueryDiscountCodesDto } from './dto/query-discount-codes.dto';
import { UpdateDiscountCodeDto } from './dto/update-discount-code.dto';
import { ValidateDiscountCodeDto } from './dto/validate-discount-code.dto';
import { DiscountCode } from './entities/discount-code.entity';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(DiscountCode)
    private readonly discountRepository: Repository<DiscountCode>,
  ) {}

  async create(dto: CreateDiscountCodeDto) {
    const code = (dto.code?.trim() || this.generateCode()).toUpperCase();
    const exists = await this.discountRepository.exist({ where: { code } });
    if (exists) {
      throw new BadRequestException('این کد تخفیف از قبل وجود دارد');
    }

    const entity = this.discountRepository.create({
      code,
      amount: dto.amount,
      description: dto.description?.trim() || null,
      isActive: dto.isActive ?? true,
      maxUses: dto.maxUses ?? null,
      usedCount: 0,
      minOrderAmount: dto.minOrderAmount ?? null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });

    return this.toResponse(await this.discountRepository.save(entity));
  }

  async findAll(query: QueryDiscountCodesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.discountRepository
      .createQueryBuilder('discount')
      .orderBy('discount.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (typeof query.isActive === 'boolean') {
      qb.andWhere('discount.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    if (query.search?.trim()) {
      qb.andWhere(
        '(discount.code ILIKE :search OR discount.description ILIKE :search)',
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

  async findOne(id: string) {
    const item = await this.discountRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('کد تخفیف یافت نشد');
    return this.toResponse(item);
  }

  async update(id: string, dto: UpdateDiscountCodeDto) {
    const item = await this.discountRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('کد تخفیف یافت نشد');

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const exists = await this.discountRepository.exist({
        where: { code },
      });
      if (exists && code !== item.code) {
        throw new BadRequestException('این کد تخفیف از قبل وجود دارد');
      }
      item.code = code;
    }

    if (dto.amount !== undefined) item.amount = dto.amount;
    if (dto.description !== undefined) {
      item.description = dto.description.trim() || null;
    }
    if (dto.isActive !== undefined) item.isActive = dto.isActive;
    if (dto.maxUses !== undefined) item.maxUses = dto.maxUses;
    if (dto.minOrderAmount !== undefined) {
      item.minOrderAmount = dto.minOrderAmount;
    }
    if (dto.expiresAt !== undefined) {
      item.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }

    return this.toResponse(await this.discountRepository.save(item));
  }

  async remove(id: string) {
    const item = await this.discountRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('کد تخفیف یافت نشد');
    await this.discountRepository.remove(item);
    return { id, deleted: true };
  }

  async validateForCart(dto: ValidateDiscountCodeDto) {
    const discount = await this.resolveUsableDiscount(
      dto.code,
      dto.cartTotal,
    );
    const discountAmount = this.computeDiscountAmount(
      dto.cartTotal,
      this.toNumber(discount.amount),
    );

    return {
      id: discount.id,
      code: discount.code,
      amount: this.toNumber(discount.amount),
      discountAmount,
      payableAmount: Math.max(0, dto.cartTotal - discountAmount),
      description: discount.description,
    };
  }

  async consumeForOrder(
    manager: EntityManager,
    code: string | undefined,
    cartTotal: number,
  ) {
    if (!code?.trim()) {
      return {
        discount: null as DiscountCode | null,
        discountAmount: 0,
        payableAmount: cartTotal,
      };
    }

    const repo = manager.getRepository(DiscountCode);
    const discount = await repo.findOne({
      where: { code: code.trim().toUpperCase() },
      lock: { mode: 'pessimistic_write' },
    });

    if (!discount) {
      throw new BadRequestException('کد تخفیف معتبر نیست');
    }

    this.assertDiscountUsable(discount, cartTotal);

    const discountAmount = this.computeDiscountAmount(
      cartTotal,
      this.toNumber(discount.amount),
    );

    discount.usedCount = Number(discount.usedCount ?? 0) + 1;
    await repo.save(discount);

    return {
      discount,
      discountAmount,
      payableAmount: Math.max(0, cartTotal - discountAmount),
    };
  }

  private async resolveUsableDiscount(code: string, cartTotal: number) {
    const discount = await this.discountRepository.findOne({
      where: { code: code.trim().toUpperCase() },
    });
    if (!discount) {
      throw new BadRequestException('کد تخفیف معتبر نیست');
    }
    this.assertDiscountUsable(discount, cartTotal);
    return discount;
  }

  private assertDiscountUsable(discount: DiscountCode, cartTotal: number) {
    if (!discount.isActive) {
      throw new BadRequestException('این کد تخفیف غیرفعال است');
    }

    if (discount.expiresAt && discount.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('مهلت استفاده از این کد تخفیف تمام شده است');
    }

    if (
      discount.maxUses != null &&
      Number(discount.usedCount) >= Number(discount.maxUses)
    ) {
      throw new BadRequestException('ظرفیت استفاده از این کد تخفیف تکمیل شده است');
    }

    const minOrder = this.toNumber(discount.minOrderAmount);
    if (minOrder > 0 && cartTotal < minOrder) {
      throw new BadRequestException(
        `حداقل مبلغ سفارش برای این کد ${minOrder.toLocaleString('fa-IR')} تومان است`,
      );
    }
  }

  private computeDiscountAmount(cartTotal: number, amount: number) {
    if (cartTotal <= 0) return 0;
    return Math.min(cartTotal, Math.max(0, amount));
  }

  private generateCode() {
    const part = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `OFF-${part}`;
  }

  private toNumber(value: unknown) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private toResponse(item: DiscountCode) {
    return {
      id: item.id,
      code: item.code,
      amount: this.toNumber(item.amount),
      description: item.description,
      isActive: item.isActive,
      maxUses: item.maxUses,
      usedCount: Number(item.usedCount ?? 0),
      minOrderAmount:
        item.minOrderAmount == null
          ? null
          : this.toNumber(item.minOrderAmount),
      expiresAt: item.expiresAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
