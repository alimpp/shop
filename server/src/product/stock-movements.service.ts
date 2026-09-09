import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { QueryStockMovementsDto } from './dto/query-stock-movements.dto';
import { StockMovement } from './entities/stock-movement.entity';
import {
  STOCK_MOVEMENT_ACTOR_LABELS,
  STOCK_MOVEMENT_REASON_LABELS,
  StockMovementActorType,
  StockMovementReason,
} from './enums/stock-movement.enum';

export type RecordStockMovementInput = {
  productId?: string | null;
  variantId?: string | null;
  orderId?: string | null;
  productName?: string | null;
  variantName?: string | null;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  reason: StockMovementReason;
  actorType: StockMovementActorType;
  actorId?: string | null;
  note?: string | null;
};

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
  ) {}

  async record(
    input: RecordStockMovementInput,
    manager?: EntityManager,
  ) {
    if (!input.quantityChange) return null;

    const repo = manager
      ? manager.getRepository(StockMovement)
      : this.stockMovementRepository;

    const entity = repo.create({
      productId: input.productId ?? null,
      variantId: input.variantId ?? null,
      orderId: input.orderId ?? null,
      productName: input.productName ?? null,
      variantName: input.variantName ?? null,
      quantityChange: input.quantityChange,
      stockBefore: input.stockBefore,
      stockAfter: input.stockAfter,
      reason: input.reason,
      actorType: input.actorType,
      actorId: input.actorId ?? null,
      note: input.note ?? null,
    });

    return repo.save(entity);
  }

  async findAll(query: QueryStockMovementsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 30;
    const search = query.search?.trim();

    const qb = this.stockMovementRepository
      .createQueryBuilder('movement')
      .orderBy('movement.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.productId) {
      qb.andWhere('movement.productId = :productId', {
        productId: query.productId,
      });
    }

    if (query.variantId) {
      qb.andWhere('movement.variantId = :variantId', {
        variantId: query.variantId,
      });
    }

    if (query.orderId) {
      qb.andWhere('movement.orderId = :orderId', { orderId: query.orderId });
    }

    if (query.reason) {
      qb.andWhere('movement.reason = :reason', { reason: query.reason });
    }

    if (search) {
      qb.andWhere(
        '(movement.productName ILIKE :search OR movement.variantName ILIKE :search OR CAST(movement.orderId AS text) ILIKE :search)',
        { search: `%${search}%` },
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

  private toResponse(item: StockMovement) {
    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      orderId: item.orderId,
      productName: item.productName,
      variantName: item.variantName,
      quantityChange: item.quantityChange,
      stockBefore: item.stockBefore,
      stockAfter: item.stockAfter,
      reason: item.reason,
      reasonLabel: STOCK_MOVEMENT_REASON_LABELS[item.reason] ?? item.reason,
      actorType: item.actorType,
      actorLabel:
        STOCK_MOVEMENT_ACTOR_LABELS[item.actorType] ?? item.actorType,
      actorId: item.actorId,
      note: item.note,
      createdAt: item.createdAt,
    };
  }
}
